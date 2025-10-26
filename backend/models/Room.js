const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  equipment: [{
    type: String,
    trim: true
  }],
  typesAllowed: [{
    type: String,
    enum: ['CM', 'TD', 'TP'],
    required: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
