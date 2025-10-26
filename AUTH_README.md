# Authentication System Guide

## Overview
The system now includes authentication with two roles:
- **Admin**: Full access to all CRUD operations, timetable generation, and management
- **Teacher**: Can register, login, and manage their own teaching preferences

## Features

### Admin Features
- Login with default credentials
- Full access to:
  - Timetable generation and management
  - Teachers CRUD (create, edit, delete teachers)
  - Subjects CRUD
  - Rooms CRUD
  - Groups CRUD
  - View and edit any teacher's preferences

### Teacher Features
- Register a new account (creates user + teacher profile automatically)
- Login to access the system
- Manage personal teaching preferences:
  - Set morning/afternoon preferences for each day (prefer/neutral/dislike)
  - Block specific time slots (hard constraints)
  - Update availability
- View home page

## Setup Instructions

### 1. Update Environment Variables
Make sure your `.env` file includes:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/university_timetable
NODE_ENV=development
JWT_SECRET=your-very-secure-jwt-secret-change-in-production
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install  # This will install bcryptjs and jsonwebtoken
```

### 3. Seed Default Admin Account
```bash
cd backend
node seed-admin.js
```

This creates the default admin account:
- **Email**: `admin@university.edu`
- **Password**: `admin123`

⚠️ **Important**: Change the admin password after first login in production!

### 4. Start the Backend Server
```bash
cd backend
npm run dev
```

### 5. Start the Frontend
```bash
cd frontend
npm run dev
```

### 6. Access the Application
Open your browser and go to: http://localhost:3000

## Usage Guide

### Admin Login
1. Go to http://localhost:3000/login
2. Enter:
   - Email: `admin@university.edu`
   - Password: `admin123`
3. Click "Login"
4. You now have full access to all features

### Teacher Registration
1. Go to http://localhost:3000/register
2. Fill in the form:
   - Full Name (e.g., "Dr. John Doe")
   - Email (e.g., "john.doe@university.edu")
   - Password (minimum 6 characters)
   - Confirm Password
   - Max Load Per Week (default: 20 hours)
3. Click "Create Account"
4. You'll be automatically logged in and redirected to set your preferences

### Teacher Preference Management
After logging in as a teacher:
1. Click "My Preferences" in the navigation
2. Set your preferences:
   - **Availability Grid**: Click cells to toggle availability (Green = Available, Red = Blocked)
   - **Preference Grid**: Set preferences for morning/afternoon slots
     - 👍 Prefer this time
     - ➖ Neutral (no preference)
     - 👎 Dislike this time
3. Click "Save Preferences"

**Note**: Wednesday afternoon is always excluded (hard constraint)

## API Endpoints

### Authentication
```
POST /api/auth/register   - Register new teacher account
POST /api/auth/login      - Login (admin or teacher)
GET  /api/auth/me         - Get current user info
POST /api/auth/logout     - Logout
```

### Teacher Self-Service
```
GET  /api/teachers/me/preferences  - Get my preferences (teachers only)
PUT  /api/teachers/me/preferences  - Update my preferences (teachers only)
```

### Admin Routes (Protected)
All existing routes require admin authentication:
```
POST   /api/teachers           - Create teacher
PUT    /api/teachers/:id       - Update teacher
DELETE /api/teachers/:id       - Delete teacher
POST   /api/subjects           - Create subject
PUT    /api/subjects/:id       - Update subject
DELETE /api/subjects/:id       - Delete subject
... (all other CRUD endpoints)
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcryptjs before storing
2. **JWT Tokens**: JSON Web Tokens are used for session management
3. **Protected Routes**: Backend routes are protected with authentication middleware
4. **Role-Based Access**: Frontend routes are protected based on user roles
5. **Token Storage**: JWT tokens are stored in localStorage
6. **Automatic Logout**: Invalid or expired tokens trigger automatic logout

## Frontend Route Protection

- `/login` - Public (login page)
- `/register` - Public (teacher registration)
- `/` - Protected (requires login)
- `/preferences` - Protected (teachers only)
- `/timetable` - Protected (admin only)
- `/teachers` - Protected (admin only)
- `/subjects` - Protected (admin only)
- `/rooms` - Protected (admin only)
- `/groups` - Protected (admin only)

## Navigation Based on Role

**Admin Navigation**:
- Home
- Timetable
- Teachers
- Subjects
- Rooms
- Groups
- User info with logout button

**Teacher Navigation**:
- Home
- My Preferences
- User info with logout button

## Troubleshooting

### "Authentication required" error
- Make sure you're logged in
- Check if your token is valid (try logging out and logging in again)

### "Admin access required" error
- You're logged in as a teacher trying to access admin routes
- Only admins can access CRUD operations

### Can't register
- Check if the email is already registered
- Ensure password is at least 6 characters
- Make sure backend server is running

### Preferences not saving
- Check if you're logged in as a teacher
- Verify backend connection
- Check browser console for errors

## Database Schema

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  role: String (admin | teacher),
  teacherId: ObjectId (ref to Teacher, null for admin),
  name: String
}
```

### Teacher Model
```javascript
{
  name: String,
  email: String,
  maxLoadPerWeek: Number,
  preferences: {
    monday: { morning: String, afternoon: String },
    // ... other days
  },
  availability: Array
}
```

## Next Steps

1. **Change default admin password** in production
2. **Update JWT_SECRET** to a strong random string
3. Consider adding:
   - Password reset functionality
   - Email verification
   - Remember me functionality
   - Session timeout
   - Password strength requirements
   - Multi-factor authentication

## Support

For issues or questions, check the console logs:
- Frontend: Browser Developer Tools Console
- Backend: Terminal where `npm run dev` is running
