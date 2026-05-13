const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { inventory, centers } = require('../data/seed');
const { AppError, asyncHandler, validateRequired } = require('../middleware/errorHandler');

// GET /api/inventory — List all (optional ?centerId= filter)
router.get('/', asyncHandler(async (req, res) => {
  let result = inventory;
  if (req.query.centerId) {
    result = inventory.filter((i) => i.centerId === req.query.centerId);
  }
  res.json({ success: true, data: result, count: result.length });
}));

// GET /api/inventory/:id — Get single item
router.get('/:id', asyncHandler(async (req, res) => {
  if (req.params.id === 'bulk') return; // skip, handled by PATCH
  const item = inventory.find((i) => i.id === req.params.id);
  if (!item) throw new AppError('Inventory item not found', 404);
  res.json({ success: true, data: item });
}));

// POST /api/inventory — Add item
router.post('/',
  validateRequired(['centerId', 'item', 'category', 'quantity', 'unit']),
  asyncHandler(async (req, res) => {
    const { centerId, item, category, quantity, unit } = req.body;

    const center = centers.find((c) => c.id === centerId);
    if (!center) throw new AppError('Associated relief center not found', 404);

    const validCategories = ['food', 'medical', 'shelter', 'water', 'clothing'];
    if (!validCategories.includes(category)) {
      throw new AppError(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400);
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      throw new AppError('Quantity must be a non-negative number', 400);
    }

    const newItem = {
      id: uuidv4(),
      centerId,
      item,
      category,
      quantity,
      unit,
      lastUpdated: new Date().toISOString()
    };

    inventory.push(newItem);
    res.status(201).json({ success: true, data: newItem });
  })
);

// PUT /api/inventory/:id — Update single item
router.put('/:id', asyncHandler(async (req, res) => {
  const idx = inventory.findIndex((i) => i.id === req.params.id);
  if (idx === -1) throw new AppError('Inventory item not found', 404);

  const { item, category, quantity, unit } = req.body;
  if (item !== undefined) inventory[idx].item = item;
  if (category !== undefined) inventory[idx].category = category;
  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || quantity < 0) {
      throw new AppError('Quantity must be a non-negative number', 400);
    }
    inventory[idx].quantity = quantity;
  }
  if (unit !== undefined) inventory[idx].unit = unit;
  inventory[idx].lastUpdated = new Date().toISOString();

  res.json({ success: true, data: inventory[idx] });
}));

// PATCH /api/inventory/bulk — Bulk update quantities
router.patch('/bulk', asyncHandler(async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError('Request body must contain a non-empty "updates" array', 400);
  }

  const results = { succeeded: [], failed: [] };

  for (const update of updates) {
    const { id, quantity } = update;

    if (!id) {
      results.failed.push({ id: null, reason: 'Missing item id' });
      continue;
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      results.failed.push({ id, reason: 'Quantity must be a non-negative number' });
      continue;
    }

    const idx = inventory.findIndex((i) => i.id === id);
    if (idx === -1) {
      results.failed.push({ id, reason: 'Item not found' });
      continue;
    }

    inventory[idx].quantity = quantity;
    inventory[idx].lastUpdated = new Date().toISOString();
    results.succeeded.push({ id, item: inventory[idx].item, newQuantity: quantity });
  }

  const statusCode = results.failed.length === updates.length ? 400 : 200;

  res.status(statusCode).json({
    success: results.succeeded.length > 0,
    data: results,
    summary: `${results.succeeded.length} updated, ${results.failed.length} failed out of ${updates.length} total`
  });
}));

// DELETE /api/inventory/:id — Delete item
router.delete('/:id', asyncHandler(async (req, res) => {
  const idx = inventory.findIndex((i) => i.id === req.params.id);
  if (idx === -1) throw new AppError('Inventory item not found', 404);

  const deleted = inventory.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Item deleted' });
}));

module.exports = router;
