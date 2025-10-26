const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_timetable';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRouter = require('./routes/auth');
const teachersRouter = require('./routes/teachers');
const subjectsRouter = require('./routes/subjects');
const roomsRouter = require('./routes/rooms');
const groupsRouter = require('./routes/groups');
const timetableRouter = require('./routes/timetable');

app.use('/api/auth', authRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/timetable', timetableRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
