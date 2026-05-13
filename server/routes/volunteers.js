const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { volunteers, dispatches, centers } = require('../data/seed');
const { AppError, asyncHandler, validateRequired } = require('../middleware/errorHandler');

// GET /api/volunteers — List all (optional ?status= filter)
router.get('/', asyncHandler(async (req, res) => {
  let result = volunteers;
  if (req.query.status) {
    result = volunteers.filter((v) => v.status === req.query.status);
  }
  res.json({ success: true, data: result, count: result.length });
}));

// GET /api/volunteers/:id — Get single volunteer
router.get('/:id', asyncHandler(async (req, res) => {
  const vol = volunteers.find((v) => v.id === req.params.id);
  if (!vol) throw new AppError('Volunteer not found', 404);
  res.json({ success: true, data: vol });
}));

// POST /api/volunteers — Register volunteer
router.post('/',
  validateRequired(['name', 'phone']),
  asyncHandler(async (req, res) => {
    const { name, phone, skills } = req.body;

    const newVol = {
      id: uuidv4(),
      name,
      skills: skills || [],
      status: 'available',
      phone,
      assignedCenterId: null
    };

    volunteers.push(newVol);
    res.status(201).json({ success: true, data: newVol });
  })
);

// PUT /api/volunteers/:id — Update volunteer
router.put('/:id', asyncHandler(async (req, res) => {
  const idx = volunteers.findIndex((v) => v.id === req.params.id);
  if (idx === -1) throw new AppError('Volunteer not found', 404);

  const { name, phone, skills, status } = req.body;
  if (name !== undefined) volunteers[idx].name = name;
  if (phone !== undefined) volunteers[idx].phone = phone;
  if (skills !== undefined) volunteers[idx].skills = skills;
  if (status !== undefined) volunteers[idx].status = status;

  res.json({ success: true, data: volunteers[idx] });
}));

// PATCH /api/volunteers/:id/dispatch — Dispatch volunteer to a center
router.patch('/:id/dispatch',
  validateRequired(['centerId', 'mission']),
  asyncHandler(async (req, res) => {
    const vol = volunteers.find((v) => v.id === req.params.id);
    if (!vol) throw new AppError('Volunteer not found', 404);

    if (vol.status === 'dispatched') {
      throw new AppError('Volunteer is already dispatched', 409);
    }
    if (vol.status === 'off-duty') {
      throw new AppError('Cannot dispatch an off-duty volunteer', 400);
    }

    const { centerId, mission, priority } = req.body;
    const center = centers.find((c) => c.id === centerId);
    if (!center) throw new AppError('Target center not found', 404);

    // Update volunteer status
    vol.status = 'dispatched';
    vol.assignedCenterId = centerId;

    // Create dispatch record
    const dispatch = {
      id: uuidv4(),
      volunteerId: vol.id,
      volunteerName: vol.name,
      centerId,
      centerName: center.name,
      mission,
      priority: priority || 'medium',
      status: 'pending',
      dispatchedAt: new Date().toISOString(),
      completedAt: null
    };

    dispatches.push(dispatch);

    res.json({
      success: true,
      data: { volunteer: vol, dispatch },
      message: `${vol.name} dispatched to ${center.name}`
    });
  })
);

// DELETE /api/volunteers/:id — Remove volunteer
router.delete('/:id', asyncHandler(async (req, res) => {
  const idx = volunteers.findIndex((v) => v.id === req.params.id);
  if (idx === -1) throw new AppError('Volunteer not found', 404);

  const deleted = volunteers.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Volunteer removed' });
}));

module.exports = router;
