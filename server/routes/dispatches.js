const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { dispatches, volunteers } = require('../data/seed');
const { AppError, asyncHandler, validateRequired } = require('../middleware/errorHandler');

// GET /api/dispatches — List all dispatches
router.get('/', asyncHandler(async (req, res) => {
  let result = dispatches;
  if (req.query.status) {
    result = dispatches.filter((d) => d.status === req.query.status);
  }
  // Sort by most recent first
  result = [...result].sort((a, b) => new Date(b.dispatchedAt) - new Date(a.dispatchedAt));
  res.json({ success: true, data: result, count: result.length });
}));

// POST /api/dispatches — Create dispatch
router.post('/',
  validateRequired(['volunteerId', 'centerId', 'mission']),
  asyncHandler(async (req, res) => {
    const { volunteerId, centerId, mission, priority } = req.body;

    const dispatch = {
      id: uuidv4(),
      volunteerId,
      centerId,
      mission,
      priority: priority || 'medium',
      status: 'pending',
      dispatchedAt: new Date().toISOString(),
      completedAt: null
    };

    dispatches.push(dispatch);
    res.status(201).json({ success: true, data: dispatch });
  })
);

// PATCH /api/dispatches/:id/complete — Mark dispatch as completed
router.patch('/:id/complete', asyncHandler(async (req, res) => {
  const dispatch = dispatches.find((d) => d.id === req.params.id);
  if (!dispatch) throw new AppError('Dispatch not found', 404);

  if (dispatch.status === 'completed') {
    throw new AppError('Dispatch is already completed', 409);
  }

  dispatch.status = 'completed';
  dispatch.completedAt = new Date().toISOString();

  // Free up the volunteer
  const vol = volunteers.find((v) => v.id === dispatch.volunteerId);
  if (vol) {
    vol.status = 'available';
    vol.assignedCenterId = null;
  }

  res.json({
    success: true,
    data: dispatch,
    message: 'Dispatch marked as completed'
  });
}));

module.exports = router;
