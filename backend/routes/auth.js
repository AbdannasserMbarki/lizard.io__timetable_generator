const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

// Register new teacher account
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, maxLoadPerWeek } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create teacher profile first
    const teacher = await Teacher.create({
      name,
      email,
      maxLoadPerWeek: maxLoadPerWeek || 20,
      preferences: {
        monday: { morning: 'neutral', afternoon: 'neutral' },
        tuesday: { morning: 'neutral', afternoon: 'neutral' },
        wednesday: { morning: 'neutral', afternoon: 'neutral' },
        thursday: { morning: 'neutral', afternoon: 'neutral' },
        friday: { morning: 'neutral', afternoon: 'neutral' },
        saturday: { morning: 'neutral', afternoon: 'neutral' }
      },
      availability: []
    });

    // Create user account linked to teacher
    const user = await User.create({
      email,
      password,
      name,
      role: 'teacher',
      teacherId: teacher._id
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        teacherId: teacher._id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).populate('teacherId');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        teacherId: user.teacherId?._id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('teacherId');
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      teacherId: user.teacherId?._id,
      teacher: user.teacherId
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
});

// Logout (client-side mainly, but can be extended)
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
