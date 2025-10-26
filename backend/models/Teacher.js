const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  preferences: {
    // Format: { monday: { morning: 'prefer'|'neutral'|'avoid', afternoon: 'prefer'|'neutral'|'avoid' }, ... }
    monday: {
      morning: { type: String, enum: ['prefer', 'neutral', 'avoid'], default: 'neutral' },
      afternoon: { type: String, enum: ['prefer', 'neutral', 'avoid'], default: 'neutral' }
    },
    tuesday: {
      morning: { type: String, enum: ['prefer', 'neutral', 'avoid'], default: 'neutral' },
      afternoon: { type: String, enum: ['prefer', 'neutral', 'avoid'], default: 'neutral' }
    },
    wednesday: {
      morning: { type: String, enum: ['prefer', 'neutral', 'avoid'], default: 'neutral' },
      afternoon: { type: String, enum: ['prefer', 'neutral', 'avoid'], default: 'neutral' }
    },
    thursday: {
      morning: { type: String, enum: ['prefer', 'neutral', 'avoid'], default: 'neutral' },
      afternoon: { type: String, enum: ['prefer', 'neutral', 'avoid'], default: 'neutral' }
    },
    friday: {
      morning: { type: String, enum: ['prefer', 'neutral', 'avoid'], default: 'neutral' },
      afternoon: { type: String, enum: ['prefer', 'neutral', 'avoid'], default: 'neutral' }
    },
    saturday: {
      morning: { type: String, enum: ['prefer', 'neutral', 'avoid'], default: 'neutral' },
      afternoon: { type: String, enum: ['prefer', 'neutral', 'avoid'], default: 'neutral' }
    }
  },
  availability: {
    // Hard blocks - format: { monday: { morning: true|false, afternoon: true|false }, ... }
    // true means available, false means blocked (hard constraint)
    monday: {
      morning: { type: Boolean, default: true },
      afternoon: { type: Boolean, default: true }
    },
    tuesday: {
      morning: { type: Boolean, default: true },
      afternoon: { type: Boolean, default: true }
    },
    wednesday: {
      morning: { type: Boolean, default: true },
      afternoon: { type: Boolean, default: false } // Wednesday afternoon excluded by default
    },
    thursday: {
      morning: { type: Boolean, default: true },
      afternoon: { type: Boolean, default: true }
    },
    friday: {
      morning: { type: Boolean, default: true },
      afternoon: { type: Boolean, default: true }
    },
    saturday: {
      morning: { type: Boolean, default: true },
      afternoon: { type: Boolean, default: true }
    }
  },
  maxLoadPerWeek: {
    type: Number,
    default: 20, // Maximum hours per week
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Teacher', teacherSchema);
