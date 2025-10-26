const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  weekRef: {
    type: String,
    required: true,
    // Format: YYYY-Www (e.g., 2024-W42)
    validate: {
      validator: function(v) {
        return /^\d{4}-W\d{2}$/.test(v);
      },
      message: props => `${props.value} is not a valid ISO week format (YYYY-Www)!`
    }
  },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }]
}, {
  timestamps: true
});

// Compound index to ensure one timetable per group per week
timetableSchema.index({ groupId: 1, weekRef: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
