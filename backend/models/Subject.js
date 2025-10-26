const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  weeklyHours: {
    type: Number,
    required: true,
    min: 1.5 // At least one slot
  },
  type: {
    type: String,
    required: true,
    enum: ['CM', 'TD', 'TP'],
    default: 'CM'
  },
  slotsPerSession: {
    type: Number,
    required: true,
    min: 1,
    max: 2,
    default: 1
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
  // Computed field - stored for convenience
  weeklySlots: {
    type: Number,
    min: 1
  }
}, {
  timestamps: true
});

// Pre-save hook to compute weeklySlots
subjectSchema.pre('save', function(next) {
  this.weeklySlots = Math.ceil(this.weeklyHours / 1.5);
  
  // Enforce TP must have 2 slots per session
  if (this.type === 'TP') {
    this.slotsPerSession = 2;
  }
  
  next();
});

// Pre-update hook to compute weeklySlots
subjectSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  if (update.weeklyHours || update.$set?.weeklyHours) {
    const weeklyHours = update.weeklyHours || update.$set?.weeklyHours;
    if (weeklyHours) {
      if (update.$set) {
        update.$set.weeklySlots = Math.ceil(weeklyHours / 1.5);
      } else {
        update.weeklySlots = Math.ceil(weeklyHours / 1.5);
      }
    }
  }
  
  // Enforce TP must have 2 slots per session
  if (update.type === 'TP' || update.$set?.type === 'TP') {
    if (update.$set) {
      update.$set.slotsPerSession = 2;
    } else {
      update.slotsPerSession = 2;
    }
  }
  
  next();
});

module.exports = mongoose.model('Subject', subjectSchema);
