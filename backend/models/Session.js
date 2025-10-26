const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  groupIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  }],
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  },
  startSlotIndex: {
    type: Number,
    required: true,
    min: 0 // 0-based index within the day
  },
  slotCount: {
    type: Number,
    required: true,
    min: 1,
    max: 2 // 1 or 2 consecutive slots
  },
  type: {
    type: String,
    required: true,
    enum: ['CM', 'TD', 'TP']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
