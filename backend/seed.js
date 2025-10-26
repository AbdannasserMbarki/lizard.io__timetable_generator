const mongoose = require('mongoose');
require('dotenv').config();

const Teacher = require('./models/Teacher');
const Subject = require('./models/Subject');
const Room = require('./models/Room');
const Group = require('./models/Group');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_timetable';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Teacher.deleteMany({});
    await Subject.deleteMany({});
    await Room.deleteMany({});
    await Group.deleteMany({});
    console.log('Cleared existing data');
    
    // Create teachers
    const teachers = await Teacher.create([
      {
        name: 'Dr. Alice Martin',
        email: 'alice.martin@university.edu',
        preferences: {
          monday: { morning: 'prefer', afternoon: 'neutral' },
          tuesday: { morning: 'prefer', afternoon: 'avoid' },
          wednesday: { morning: 'neutral', afternoon: 'neutral' },
          thursday: { morning: 'neutral', afternoon: 'prefer' },
          friday: { morning: 'avoid', afternoon: 'avoid' },
          saturday: { morning: 'neutral', afternoon: 'neutral' }
        },
        availability: {
          monday: { morning: true, afternoon: true },
          tuesday: { morning: true, afternoon: true },
          wednesday: { morning: true, afternoon: false },
          thursday: { morning: true, afternoon: true },
          friday: { morning: true, afternoon: false },
          saturday: { morning: true, afternoon: true }
        },
        maxLoadPerWeek: 18
      },
      {
        name: 'Prof. Bob Johnson',
        email: 'bob.johnson@university.edu',
        preferences: {
          monday: { morning: 'neutral', afternoon: 'prefer' },
          tuesday: { morning: 'prefer', afternoon: 'prefer' },
          wednesday: { morning: 'prefer', afternoon: 'neutral' },
          thursday: { morning: 'neutral', afternoon: 'neutral' },
          friday: { morning: 'neutral', afternoon: 'avoid' },
          saturday: { morning: 'avoid', afternoon: 'avoid' }
        },
        availability: {
          monday: { morning: true, afternoon: true },
          tuesday: { morning: true, afternoon: true },
          wednesday: { morning: true, afternoon: false },
          thursday: { morning: true, afternoon: true },
          friday: { morning: true, afternoon: true },
          saturday: { morning: false, afternoon: false }
        },
        maxLoadPerWeek: 20
      },
      {
        name: 'Dr. Carol Smith',
        email: 'carol.smith@university.edu',
        preferences: {
          monday: { morning: 'prefer', afternoon: 'prefer' },
          tuesday: { morning: 'neutral', afternoon: 'neutral' },
          wednesday: { morning: 'prefer', afternoon: 'neutral' },
          thursday: { morning: 'prefer', afternoon: 'neutral' },
          friday: { morning: 'neutral', afternoon: 'neutral' },
          saturday: { morning: 'neutral', afternoon: 'neutral' }
        },
        maxLoadPerWeek: 22
      },
      {
        name: 'Dr. David Lee',
        email: 'david.lee@university.edu',
        preferences: {
          monday: { morning: 'neutral', afternoon: 'neutral' },
          tuesday: { morning: 'prefer', afternoon: 'neutral' },
          wednesday: { morning: 'neutral', afternoon: 'neutral' },
          thursday: { morning: 'avoid', afternoon: 'prefer' },
          friday: { morning: 'prefer', afternoon: 'neutral' },
          saturday: { morning: 'neutral', afternoon: 'avoid' }
        },
        maxLoadPerWeek: 18
      }
    ]);
    console.log(`Created ${teachers.length} teachers`);
    
    // Create groups
    const groups = await Group.create([
      { name: 'L3-INFO-A', size: 35, specialty: 'Computer Science', year: 3 },
      { name: 'L3-INFO-B', size: 32, specialty: 'Computer Science', year: 3 },
      { name: 'M1-AI-A', size: 28, specialty: 'Artificial Intelligence', year: 4 },
      { name: 'M1-AI-B', size: 25, specialty: 'Artificial Intelligence', year: 4 },
      { name: 'M2-DATA', size: 20, specialty: 'Data Science', year: 5 }
    ]);
    console.log(`Created ${groups.length} groups`);
    
    // Create rooms
    const rooms = await Room.create([
      { 
        name: 'Amphi A', 
        capacity: 100, 
        equipment: ['projector', 'microphone', 'speakers'],
        typesAllowed: ['CM']
      },
      { 
        name: 'Amphi B', 
        capacity: 80, 
        equipment: ['projector', 'microphone'],
        typesAllowed: ['CM']
      },
      { 
        name: 'Salle TD-101', 
        capacity: 40, 
        equipment: ['whiteboard', 'projector'],
        typesAllowed: ['CM', 'TD']
      },
      { 
        name: 'Salle TD-102', 
        capacity: 40, 
        equipment: ['whiteboard', 'projector'],
        typesAllowed: ['CM', 'TD']
      },
      { 
        name: 'Salle TD-103', 
        capacity: 35, 
        equipment: ['whiteboard'],
        typesAllowed: ['TD']
      },
      { 
        name: 'Lab TP-201', 
        capacity: 30, 
        equipment: ['computers', 'projector', 'network'],
        typesAllowed: ['TP']
      },
      { 
        name: 'Lab TP-202', 
        capacity: 30, 
        equipment: ['computers', 'projector', 'network'],
        typesAllowed: ['TP']
      },
      { 
        name: 'Lab TP-203', 
        capacity: 25, 
        equipment: ['computers', 'network'],
        typesAllowed: ['TP']
      }
    ]);
    console.log(`Created ${rooms.length} rooms`);
    
    // Create subjects
    const subjects = await Subject.create([
      {
        name: 'Algorithms & Data Structures',
        code: 'CS301',
        weeklyHours: 4.5,
        type: 'CM',
        slotsPerSession: 1,
        teacherId: teachers[0]._id,
        groupIds: [groups[0]._id, groups[1]._id]
      },
      {
        name: 'Algorithms TD',
        code: 'CS301-TD',
        weeklyHours: 3,
        type: 'TD',
        slotsPerSession: 1,
        teacherId: teachers[0]._id,
        groupIds: [groups[0]._id]
      },
      {
        name: 'Programming TP',
        code: 'CS302-TP',
        weeklyHours: 4.5,
        type: 'TP',
        slotsPerSession: 2,
        teacherId: teachers[1]._id,
        groupIds: [groups[0]._id]
      },
      {
        name: 'Database Systems',
        code: 'CS401',
        weeklyHours: 3,
        type: 'CM',
        slotsPerSession: 1,
        teacherId: teachers[2]._id,
        groupIds: [groups[2]._id, groups[3]._id]
      },
      {
        name: 'Database TP',
        code: 'CS401-TP',
        weeklyHours: 3,
        type: 'TP',
        slotsPerSession: 2,
        teacherId: teachers[2]._id,
        groupIds: [groups[2]._id]
      },
      {
        name: 'Machine Learning',
        code: 'AI501',
        weeklyHours: 4.5,
        type: 'CM',
        slotsPerSession: 1,
        teacherId: teachers[3]._id,
        groupIds: [groups[4]._id]
      },
      {
        name: 'ML Practical',
        code: 'AI501-TP',
        weeklyHours: 6,
        type: 'TP',
        slotsPerSession: 2,
        teacherId: teachers[3]._id,
        groupIds: [groups[4]._id]
      },
      {
        name: 'Software Engineering',
        code: 'CS303',
        weeklyHours: 3,
        type: 'CM',
        slotsPerSession: 1,
        teacherId: teachers[1]._id,
        groupIds: [groups[0]._id, groups[1]._id]
      },
      {
        name: 'Web Development',
        code: 'CS304',
        weeklyHours: 4.5,
        type: 'TD',
        slotsPerSession: 1,
        teacherId: teachers[0]._id,
        groupIds: [groups[1]._id]
      }
    ]);
    console.log(`Created ${subjects.length} subjects`);
    
    console.log('\nSeed data summary:');
    console.log('-------------------');
    console.log(`Teachers: ${teachers.length}`);
    console.log(`Groups: ${groups.length}`);
    console.log(`Rooms: ${rooms.length}`);
    console.log(`Subjects: ${subjects.length}`);
    console.log('\nSample data created successfully!');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
