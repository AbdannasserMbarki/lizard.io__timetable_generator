# Intelligent University Timetable MVP

Automated university timetable generator using heuristic algorithms with support for custom 1.5-hour slots, TP double-slots, and teacher preference optimization.

## 🎯 Features

### Core Functionality
- **Heuristic Scheduling Algorithm**: Smart placement with constraint satisfaction and preference optimization
- **1.5-Hour Slot System**: Custom slot duration (08:15-09:45, 10:00-11:30, 11:45-13:15, 15:00-16:30, 16:45-18:15)
- **TP Double-Slot Support**: Automatic 3-hour practical sessions using 2 consecutive slots
- **Teacher Preferences**: Morning/afternoon preferences per day with configurable weights
- **Hard Constraints**: No overlaps, room capacity, availability blocks, Wednesday PM exclusion
- **Soft Constraints**: Teacher preferences, day balance, non-adjacency for groups

### Data Management
- **Teachers**: Name, email, preferences, availability, max weekly load
- **Subjects**: Weekly hours, type (CM/TD/TP), slots per session, assigned groups
- **Rooms**: Capacity, equipment, allowed session types
- **Groups**: Student count, specialty, year
- **Timetables**: Per-group weekly schedules with sessions

### User Interface
- Modern React frontend with TailwindCSS
- Interactive CRUD operations for all entities
- Visual timetable grid with color-coded sessions
- Teacher preference/availability editor
- Real-time conflict detection
- Generation statistics and unplaced session reports

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
```
backend/
├── models/          # Mongoose schemas
├── routes/          # RESTful API endpoints
├── services/        # Scheduling algorithm
├── app.js           # Express setup
└── seed.js          # Sample data generator
```

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── api/         # API client
│   ├── components/  # Reusable UI components
│   ├── pages/       # Main application pages
│   └── App.jsx      # Router and navigation
```

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MongoDB v4.4+
- npm or yarn

### Installation

1. **Clone and setup**
```bash
cd mini_projet
```

2. **Backend setup**
```bash
cd backend
npm install
```

3. **Frontend setup**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

2. **Seed the database** (optional but recommended)
```bash
cd backend
node seed.js
```

3. **Start backend server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

4. **Start frontend** (in a new terminal)
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

5. **Open browser**
Navigate to http://localhost:3000

## 📖 Usage Guide

### 1. Setup Data
1. Go to **Teachers** page → Add teachers and set their preferences
2. Go to **Rooms** page → Define available rooms with capacities
3. Go to **Groups** page → Create student groups
4. Go to **Subjects** page → Create subjects with:
   - Weekly hours (e.g., 4.5h)
   - Type: CM (lecture), TD (tutorial), or TP (practical)
   - Assign teacher and groups

### 2. Generate Timetable
1. Go to **Timetable** page
2. Select week (ISO format: YYYY-Www)
3. Select group to view
4. Choose scope:
   - **All Groups**: Generate for entire institution
   - **Selected Group**: Generate for one group only
5. Choose rounding policy:
   - **Round Up**: Adds extra session to cover remaining hours
   - **Round Down**: May leave some hours unscheduled
6. Click **Generate Timetable**
7. View results with statistics

### 3. View and Manage
- **Timetable Grid**: Color-coded sessions by type
  - Blue: CM (Lectures)
  - Green: TD (Tutorials)
  - Purple: TP (Practicals - 3h blocks)
- **Click sessions** to view details
- **Delete timetables** to regenerate

## 🔧 Configuration

### Scheduling Weights (backend/services/scheduler.js)
```javascript
const WEIGHTS = {
  teacherPreference: 3,  // Teacher preference importance
  balance: 2,            // Day distribution balance
  nonAdjacency: 1,       // Avoid back-to-back sessions
  roomFit: 1             // Prefer tight room capacity fit
};
```

### Slot Configuration
- **Slot duration**: 1.5 hours
- **Break duration**: 15 minutes
- **Morning slots**: 3 (08:15-13:15)
- **Afternoon slots**: 2 (15:00-18:15)
- **Wednesday afternoon**: Always excluded

## 📊 API Endpoints

### Teachers
- `GET /api/teachers` - List all
- `POST /api/teachers` - Create
- `PUT /api/teachers/:id` - Update
- `DELETE /api/teachers/:id` - Delete
- `GET /api/teachers/:id/preferences` - Get preferences
- `PUT /api/teachers/:id/preferences` - Update preferences

### Subjects
- `GET /api/subjects` - List all
- `POST /api/subjects` - Create
- `PUT /api/subjects/:id` - Update
- `DELETE /api/subjects/:id` - Delete

### Rooms
- `GET /api/rooms` - List all
- `POST /api/rooms` - Create
- `PUT /api/rooms/:id` - Update
- `DELETE /api/rooms/:id` - Delete

### Groups
- `GET /api/groups` - List all
- `POST /api/groups` - Create
- `PUT /api/groups/:id` - Update
- `DELETE /api/groups/:id` - Delete

### Timetable
- `POST /api/timetable/generate?week=YYYY-Www&scope=all|group&groupId=&rounding=up|down` - Generate
- `GET /api/timetable/:groupId/:week` - Get group timetable
- `GET /api/timetable/week/:week` - Get all timetables for week
- `PUT /api/timetable/:groupId/:week/session/:sessionId` - Update session
- `POST /api/timetable/validate` - Validate session
- `DELETE /api/timetable/:groupId/:week` - Delete timetable

## 🧪 Testing

The seed script creates sample data:
- 4 teachers with varied preferences
- 5 student groups
- 8 rooms (amphitheaters, TD rooms, TP labs)
- 9 subjects (CM, TD, TP types)

Test generation with:
```bash
# Generate for current week
curl -X POST "http://localhost:5000/api/timetable/generate?week=2024-W43&scope=all&rounding=up"
```

## 🎓 Scheduling Algorithm

### Process
1. **Demand Generation**: Convert subjects to session units based on weekly hours and slots per session
2. **Difficulty Ordering**: Prioritize TP (2-slot), large groups, scarce resources
3. **Candidate Evaluation**: Score each (day, slot, room) combination
4. **Greedy Placement**: Place best-scoring candidate, mark slots occupied
5. **Validation**: Check all hard constraints satisfied
6. **Per-Group Storage**: One timetable document per group per week

### Scoring Factors
- Teacher preference match (+10 prefer, -5 avoid)
- Day distribution bonus (fewer sessions on day = higher score)
- Room capacity fit (prefer tight fit)
- Balance across week

### Constraints
**Hard** (must satisfy):
- No teacher/group/room overlaps
- Room capacity ≥ total group size
- Session type allowed in room
- Teacher availability blocks respected
- TP requires 2 consecutive free slots
- Wednesday afternoon excluded

**Soft** (optimized by scoring):
- Teacher preferences honored
- Sessions spread across days
- Avoid clustering same subject
- Alternate AM/PM when possible

## 🛠️ Tech Stack

**Backend**:
- Node.js + Express
- MongoDB + Mongoose
- CORS, dotenv, express-validator

**Frontend**:
- React 19
- Vite 7
- React Router 6
- Axios
- TailwindCSS 4
- Lucide React (icons)

## 📝 License

MIT

## 🤝 Contributing

This is an MVP project. Feel free to extend with:
- Drag-and-drop session rescheduling
- Multi-week generation
- Export to PDF/iCal
- Teacher workload analytics
- Room utilization reports
- Genetic algorithm optimization
- Constraint relaxation for unplaceable sessions

## 📧 Support

For issues or questions, refer to the API documentation and code comments.
