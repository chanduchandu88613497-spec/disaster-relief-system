const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { centers } = require('../data/seed');
const { AppError, asyncHandler, validateRequired } = require('../middleware/errorHandler');

// GET /api/centers — List all centers
router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, data: centers, count: centers.length });
}));

// GET /api/centers/:id — Get single center
router.get('/:id', asyncHandler(async (req, res) => {
  const center = centers.find((c) => c.id === req.params.id);
  if (!center) throw new AppError('Relief center not found', 404);
  res.json({ success: true, data: center });
}));

// POST /api/centers — Create center
router.post('/',
  validateRequired(['name', 'address', 'capacity']),
  asyncHandler(async (req, res) => {
    const { name, address, capacity, location, status } = req.body;

    if (typeof capacity !== 'number' || capacity <= 0) {
      throw new AppError('Capacity must be a positive number', 400);
    }

    const newCenter = {
      id: uuidv4(),
      name,
      location: location || { lat: 0, lng: 0 },
      address,
      status: status || 'active',
      capacity,
      currentLoad: 0
    };

    centers.push(newCenter);
    res.status(201).json({ success: true, data: newCenter });
  })
);

// PUT /api/centers/:id — Update center
router.put('/:id', asyncHandler(async (req, res) => {
  const idx = centers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) throw new AppError('Relief center not found', 404);

  const { name, address, capacity, location, status, currentLoad } = req.body;
  if (name !== undefined) centers[idx].name = name;
  if (address !== undefined) centers[idx].address = address;
  if (capacity !== undefined) centers[idx].capacity = capacity;
  if (location !== undefined) centers[idx].location = location;
  if (status !== undefined) centers[idx].status = status;
  if (currentLoad !== undefined) centers[idx].currentLoad = currentLoad;

  res.json({ success: true, data: centers[idx] });
}));

// DELETE /api/centers/:id — Delete center
router.delete('/:id', asyncHandler(async (req, res) => {
  const idx = centers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) throw new AppError('Relief center not found', 404);

  const deleted = centers.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Center deleted' });
}));

module.exports = router;
