# Setup and Installation Guide

## Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js (should be v14+)
node --version

# Check npm
npm --version

# Check MongoDB (should be v4.4+)
mongod --version
```

If any are missing:
- **Node.js & npm**: Download from https://nodejs.org/
- **MongoDB**: Download from https://www.mongodb.com/try/download/community

## Step-by-Step Setup

### 1. Start MongoDB

**Linux/Mac:**
```bash
# Start MongoDB service
sudo systemctl start mongod
# OR
mongod --dbpath /path/to/data/directory
```

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
# OR run from installation directory
"C:\Program Files\MongoDB\Server\X.X\bin\mongod.exe"
```

Verify MongoDB is running:
```bash
mongosh
# or
mongo
# Should connect successfully
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file (if not exists)
cp .env.example .env

# Seed database with sample data
node seed.js
```

Expected output:
```
Connected to MongoDB
Cleared existing data
Created 4 teachers
Created 5 groups
Created 8 rooms
Created 9 subjects
Seed data created successfully!
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
Connected to MongoDB
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the University Timetable home page.

## Verification Steps

### 1. Check Backend API
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "mongodb": "connected"
}
```

### 2. Check Seeded Data

Visit these pages to verify data was seeded:
- http://localhost:3000/teachers (should show 4 teachers)
- http://localhost:3000/groups (should show 5 groups)
- http://localhost:3000/rooms (should show 8 rooms)
- http://localhost:3000/subjects (should show 9 subjects)

### 3. Generate a Timetable

1. Go to http://localhost:3000/timetable
2. Select current week
3. Select a group (e.g., L3-INFO-A)
4. Click "Generate Timetable"
5. Wait for generation to complete
6. View the generated schedule

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
```bash
# Make sure MongoDB is running
sudo systemctl status mongod

# If not running, start it
sudo systemctl start mongod
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using the port
lsof -i :5000
# or on Windows
netstat -ano | findstr :5000

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### Frontend Build Errors

**Error:** Module not found or compilation errors

**Solution:**
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Database Issues

**Reset database:**
```bash
mongosh
use university_timetable
db.dropDatabase()
exit

# Re-seed
cd backend
node seed.js
```

## Development Workflow

### Making Changes

**Backend changes:**
- Edit files in `backend/`
- Server auto-restarts with nodemon
- Check console for errors

**Frontend changes:**
- Edit files in `frontend/src/`
- Browser auto-refreshes
- Check browser console for errors

### Adding New Features

1. **New model:** Create in `backend/models/`
2. **New API route:** Create in `backend/routes/`
3. **New page:** Create in `frontend/src/pages/`
4. **New component:** Create in `frontend/src/components/`

### Testing Changes

```bash
# Backend tests (if configured)
cd backend
npm test

# Frontend build check
cd frontend
npm run build
```

## Production Deployment

### Backend

```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

Set proper environment variables:
```
MONGODB_URI=mongodb://production-host:27017/timetable
PORT=5000
NODE_ENV=production
```

### Frontend

```bash
cd frontend
npm run build
```

Deploy the `dist/` folder to a static hosting service (Netlify, Vercel, etc.) or serve with nginx/Apache.

Update API proxy or use full backend URL in production.

## Common Commands

```bash
# Backend
npm run dev          # Development with nodemon
npm start            # Production
node seed.js         # Seed database

# Frontend  
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build

# Database
mongosh              # Connect to MongoDB shell
node seed.js         # Reset and seed data
```

## Next Steps

After successful setup:

1. Explore the **Teachers** page - Set preferences and availability
2. Check **Subjects** page - Review course configurations
3. Visit **Timetable** page - Generate your first schedule
4. Experiment with different generation parameters
5. Review the generated schedule and statistics

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review console logs (both backend and frontend)
3. Verify all prerequisites are installed
4. Check that MongoDB is running and accessible
5. Ensure all dependencies are installed correctly

For detailed API documentation, see `backend/README.md`.
For frontend documentation, see `frontend/README.md`.
