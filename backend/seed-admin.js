const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_timetable';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@university.edu' });
    
    if (existingAdmin) {
      console.log('Admin account already exists');
      process.exit(0);
    }

    // Create default admin account
    const admin = await User.create({
      email: 'admin@university.edu',
      password: 'admin123',  // Change this in production!
      name: 'Administrator',
      role: 'admin'
    });

    console.log('✅ Default admin account created successfully');
    console.log('Email: admin@university.edu');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
