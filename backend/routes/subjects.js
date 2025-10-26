const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// GET all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('teacherId', 'name email')
      .populate('groupIds', 'name size');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET one subject
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('teacherId', 'name email')
      .populate('groupIds', 'name size');
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create subject
router.post('/', async (req, res) => {
  const subject = new Subject(req.body);
  
  try {
    const newSubject = await subject.save();
    const populated = await Subject.findById(newSubject._id)
      .populate('teacherId', 'name email')
      .populate('groupIds', 'name size');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update subject
router.put('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('teacherId', 'name email')
     .populate('groupIds', 'name size');
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE subject
router.delete('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
