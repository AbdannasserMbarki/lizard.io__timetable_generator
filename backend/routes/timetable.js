const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const Session = require('../models/Session');
const {
  generateTimetable,
  validateSession,
  checkConflicts
} = require('../services/scheduler');

// POST generate timetable
router.post('/generate', async (req, res) => {
  try {
    const { week, scope = 'all', groupId, rounding = 'up' } = req.query;
    
    if (!week) {
      return res.status(400).json({ message: 'Week parameter is required (format: YYYY-Www)' });
    }
    
    // Validate week format
    if (!/^\d{4}-W\d{2}$/.test(week)) {
      return res.status(400).json({ message: 'Invalid week format. Use YYYY-Www (e.g., 2024-W42)' });
    }
    
    if (scope === 'group' && !groupId) {
      return res.status(400).json({ message: 'groupId is required when scope is "group"' });
    }
    
    const result = await generateTimetable(week, scope, groupId, rounding);
    res.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate timetable',
      error: error.message 
    });
  }
});

// GET timetable for a group and week
router.get('/:groupId/:week', async (req, res) => {
  try {
    const { groupId, week } = req.params;
    
    const timetable = await Timetable.findOne({ groupId, weekRef: week })
      .populate({
        path: 'sessions',
        populate: [
          { path: 'subjectId', select: 'name code type' },
          { path: 'teacherId', select: 'name' },
          { path: 'roomId', select: 'name capacity' },
          { path: 'groupIds', select: 'name' }
        ]
      });
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update/move a session
router.put('/:groupId/:week/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { day, startSlotIndex, roomId } = req.body;
    
    // Get existing session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Prepare update data
    const updateData = {
      ...session.toObject(),
      day: day || session.day,
      startSlotIndex: startSlotIndex !== undefined ? startSlotIndex : session.startSlotIndex,
      roomId: roomId || session.roomId
    };
    
    // Validate the new placement
    const validation = await validateSession(updateData);
    if (!validation.valid) {
      return res.status(400).json({ 
        message: 'Invalid session placement',
        errors: validation.errors
      });
    }
    
    // Check for conflicts
    const conflicts = await checkConflicts(updateData, sessionId);
    if (conflicts.length > 0) {
      return res.status(409).json({ 
        message: 'Session conflicts detected',
        conflicts: conflicts.map(c => ({
          type: c.type,
          sessionId: c.session._id,
          day: c.session.day,
          startSlotIndex: c.session.startSlotIndex
        }))
      });
    }
    
    // Update session
    session.day = updateData.day;
    session.startSlotIndex = updateData.startSlotIndex;
    session.roomId = updateData.roomId;
    await session.save();
    
    const updatedSession = await Session.findById(sessionId)
      .populate('subjectId', 'name code type')
      .populate('teacherId', 'name')
      .populate('roomId', 'name capacity')
      .populate('groupIds', 'name');
    
    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST validate arbitrary session data
router.post('/validate', async (req, res) => {
  try {
    const validation = await validateSession(req.body);
    
    if (!validation.valid) {
      return res.json({ 
        valid: false,
        errors: validation.errors
      });
    }
    
    const conflicts = await checkConflicts(req.body);
    
    res.json({
      valid: conflicts.length === 0,
      errors: validation.errors,
      conflicts: conflicts.map(c => ({
        type: c.type,
        sessionId: c.session._id,
        day: c.session.day,
        startSlotIndex: c.session.startSlotIndex
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all timetables for a week
router.get('/week/:week', async (req, res) => {
  try {
    const { week } = req.params;
    
    const timetables = await Timetable.find({ weekRef: week })
      .populate('groupId', 'name specialty year')
      .populate({
        path: 'sessions',
        populate: [
          { path: 'subjectId', select: 'name code type' },
          { path: 'teacherId', select: 'name' },
          { path: 'roomId', select: 'name capacity' }
        ]
      });
    
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE timetable
router.delete('/:groupId/:week', async (req, res) => {
  try {
    const { groupId, week } = req.params;
    
    const timetable = await Timetable.findOne({ groupId, weekRef: week });
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    // Delete associated sessions
    await Session.deleteMany({ _id: { $in: timetable.sessions } });
    
    // Delete timetable
    await Timetable.findByIdAndDelete(timetable._id);
    
    res.json({ message: 'Timetable and sessions deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
