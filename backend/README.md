# University Timetable - Backend

Intelligent University Timetable Generator Backend API built with Node.js, Express, and MongoDB.

## Features

- **Heuristic Scheduling Algorithm**: Intelligent placement of sessions based on constraints and preferences
- **1.5-hour Slot System**: Custom slot duration with 15-minute breaks
- **TP Double-Slot Support**: Automatic handling of 3-hour practical sessions (2 consecutive slots)
- **Preference Optimization**: Teacher morning/afternoon preferences with configurable weights
- **Conflict Detection**: Real-time validation of teacher, room, and group conflicts
- **Wednesday Afternoon Exclusion**: Built-in constraint for academic schedules
- **RESTful API**: Complete CRUD operations for all entities

## Quick Start

### Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+)

### Installation

```bash
cd backend
npm install
```



### Database Setup

Seed the database with sample data:

```bash
node seed.js
```

### Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Teachers
- `GET /api/teachers` - List all teachers
- `GET /api/teachers/:id` - Get teacher details
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher
- `GET /api/teachers/:id/preferences` - Get preferences
- `PUT /api/teachers/:id/preferences` - Update preferences

### Subjects
- `GET /api/subjects` - List all subjects
- `GET /api/subjects/:id` - Get subject details
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Rooms
- `GET /api/rooms` - List all rooms
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Groups
- `GET /api/groups` - List all groups
- `GET /api/groups/:id` - Get group details
- `POST /api/groups` - Create group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Timetable
- `POST /api/timetable/generate?week=YYYY-Www&scope=all|group&groupId=&rounding=up|down` - Generate timetable
- `GET /api/timetable/:groupId/:week` - Get group timetable
- `GET /api/timetable/week/:week` - Get all timetables for a week
- `PUT /api/timetable/:groupId/:week/session/:sessionId` - Update session
- `POST /api/timetable/validate` - Validate session placement
- `DELETE /api/timetable/:groupId/:week` - Delete timetable

## Data Models

### Teacher
```javascript
{
  name: String,
  email: String (unique),
  preferences: {
    monday: { morning, afternoon },  // 'prefer' | 'neutral' | 'avoid'
    // ... other days
  },
  availability: {
    monday: { morning, afternoon },  // true | false (hard blocks)
    // ... other days
  },
  maxLoadPerWeek: Number
}
```

### Subject
```javascript
{
  name: String,
  code: String (unique),
  weeklyHours: Number,
  type: 'CM' | 'TD' | 'TP',
  slotsPerSession: Number (1 or 2, forced to 2 for TP),
  teacherId: ObjectId,
  groupIds: [ObjectId],
  weeklySlots: Number (computed)
}
```

### Room
```javascript
{
  name: String (unique),
  capacity: Number,
  equipment: [String],
  typesAllowed: ['CM', 'TD', 'TP']
}
```

### Group
```javascript
{
  name: String (unique),
  size: Number,
  specialty: String,
  year: Number (1-5)
}
```

### Session
```javascript
{
  subjectId: ObjectId,
  teacherId: ObjectId,
  groupIds: [ObjectId],
  roomId: ObjectId,
  day: 'monday' | 'tuesday' | ...,
  startSlotIndex: Number (0-4),
  slotCount: Number (1 or 2),
  type: 'CM' | 'TD' | 'TP'
}
```

## Scheduling Algorithm

### Slot System
- **Duration**: 1.5 hours (90 minutes)
- **Morning slots**: 08:15-09:45, 10:00-11:30, 11:45-13:15 (indices 0, 1, 2)
- **Afternoon slots**: 15:00-16:30, 16:45-18:15 (indices 3, 4)
- **Break**: 15 minutes between slots
- **Wednesday afternoon**: Excluded from scheduling

### Constraints

**Hard Constraints** (must be satisfied):
- No overlaps for teacher, group, or room
- Room capacity ≥ total group size
- Session type ∈ room.typesAllowed
- Teacher hard unavailability respected
- TP requires 2 consecutive slots in same room
- Wednesday afternoon excluded

**Soft Constraints** (optimized by scoring):
- Teacher morning/afternoon preferences
- Balance sessions across days
- Avoid clustering same subject on one day
- Prefer alternating AM/PM for groups
- Minimize capacity slack (tight room fit)

### Scoring Weights
```javascript
{
  teacherPreference: 3,
  balance: 2,
  nonAdjacency: 1,
  roomFit: 1
}
```

### Process
1. Generate session demands from subjects (calculate slots, apply rounding policy)
2. Order by difficulty: TP first, larger groups, scarce resources
3. For each session: evaluate all (day, slot, room) candidates
4. Score each candidate using weights and constraints
5. Place best candidate, mark slots occupied
6. Persist per-group timetable documents
7. Return stats and any unplaced sessions

## Testing

Run tests:
```bash
npm test
```

## Project Structure

```
backend/
├── models/           # Mongoose schemas
│   ├── Teacher.js
│   ├── Subject.js
│   ├── Room.js
│   ├── Group.js
│   ├── Session.js
│   └── Timetable.js
├── routes/           # API routes
│   ├── teachers.js
│   ├── subjects.js
│   ├── rooms.js
│   ├── groups.js
│   └── timetable.js
├── services/         # Business logic
│   └── scheduler.js  # Scheduling algorithm
├── app.js            # Express app setup
├── seed.js           # Database seeding
└── package.json
```

## License

MIT
