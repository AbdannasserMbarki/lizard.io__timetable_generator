const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET all teachers (public for dropdown selections)
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET one teacher
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET teacher preferences
router.get('/:id/preferences', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json({
      preferences: teacher.preferences,
      availability: teacher.availability
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update teacher preferences
router.put('/:id/preferences', async (req, res) => {
  try {
    const { preferences, availability } = req.body;
    
    const updateData = {};
    if (preferences) updateData.preferences = preferences;
    if (availability) updateData.availability = availability;
    
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Teacher self-service: Get my preferences
router.get('/me/preferences', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can access this' });
    }

    const teacher = await Teacher.findById(req.user.teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    res.json({
      preferences: teacher.preferences,
      availability: teacher.availability
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher self-service: Update my preferences
router.put('/me/preferences', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can access this' });
    }

    const { preferences, availability } = req.body;
    
    const updateData = {};
    if (preferences) updateData.preferences = preferences;
    if (availability) updateData.availability = availability;
    
    const teacher = await Teacher.findByIdAndUpdate(
      req.user.teacherId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Protect admin routes
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const teacher = new Teacher(req.body);
  
  try {
    const newTeacher = await teacher.save();
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
