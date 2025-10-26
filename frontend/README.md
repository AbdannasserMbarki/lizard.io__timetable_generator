# University Timetable - Frontend

React frontend for the Intelligent University Timetable Generator built with Vite, React Router, and TailwindCSS.

## Features

- **CRUD Management**: Teachers, Subjects, Rooms, and Groups
- **Teacher Preferences**: Interactive availability and preference editor
- **Timetable Generation**: Visual interface for generating and viewing schedules
- **Real-time Validation**: Conflict detection and session validation
- **Responsive Design**: Modern UI with TailwindCSS
- **Icon Library**: Lucide React icons for clean UI elements

## Quick Start

### Prerequisites

- Node.js (v14+)
- Backend API running on port 5000

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The application will be available at http://localhost:3000 with API proxy configured to http://localhost:5000.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and endpoints
│   │   └── client.js
│   ├── components/       # Reusable components
│   │   ├── TeacherForm.jsx
│   │   ├── SubjectForm.jsx
│   │   ├── RoomForm.jsx
│   │   ├── GroupForm.jsx
│   │   ├── AvailabilityEditor.jsx
│   │   └── TimetableGrid.jsx
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Teachers.jsx
│   │   ├── Subjects.jsx
│   │   ├── Rooms.jsx
│   │   ├── Groups.jsx
│   │   └── Timetable.jsx
│   ├── App.jsx           # Main app with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Tailwind CSS
├── package.json
└── vite.config.js
```

## Pages

### Home
Landing page with overview and navigation cards

### Teachers
- List all teachers
- Add/edit/delete teachers
- Manage preferences and availability (morning/afternoon per day)

### Subjects
- List all subjects with details
- Create subjects with:
  - Weekly hours
  - Type (CM/TD/TP)
  - Slots per session (auto 2 for TP)
  - Assigned teacher
  - Target groups

### Rooms
- Manage rooms with capacity and equipment
- Set allowed session types

### Groups
- Organize student groups
- Define size, specialty, and year

### Timetable
- Generate timetables for all groups or a single group
- View weekly schedules in grid format
- Click sessions to view details
- Delete timetables

## Components

### AvailabilityEditor
Interactive grid for setting teacher:
- **Availability** (hard constraints): Block unavailable time slots
- **Preferences** (soft constraints): Prefer/neutral/avoid settings
- Wednesday afternoon automatically excluded

### TimetableGrid
Displays weekly schedule:
- Morning slots: 08:15-09:45, 10:00-11:30, 11:45-13:15
- Afternoon slots: 15:00-16:30, 16:45-18:15
- Color-coded by type (CM/TD/TP)
- TP sessions span 2 consecutive slots (3h)
- Click to view session details

### Forms
Modal forms for CRUD operations with validation:
- **TeacherForm**: Basic info and max load
- **SubjectForm**: Complete subject configuration
- **RoomForm**: Capacity, equipment, types allowed
- **GroupForm**: Student group details

## API Integration

All API calls go through `/api/client.js`:
- Axios instance with base URL `/api`
- Proxy configured in `vite.config.js` to backend
- Organized by resource (teachers, subjects, rooms, groups, timetable)

## Styling

- **TailwindCSS** for utility-first styling
- **Lucide React** for icons
- Responsive design with mobile support
- Clean, modern UI with consistent spacing

## Key Features

### Timetable Generation
- Select week (ISO format: YYYY-Www)
- Choose scope: all groups or single group
- Rounding policy: up or down for partial slots
- Real-time generation status with stats
- Display unplaced sessions if any

### Session Display
- Color-coded by type
- Shows subject, teacher, room
- TP sessions clearly marked as 3h blocks
- Wednesday afternoon excluded slots grayed out
- Interactive session cards with details modal

### Validation
- Form validation before submission
- Conflict detection for sessions
- Capacity checks for rooms
- Teacher availability enforcement

## Development Notes

- Uses React Router for navigation
- State management with React hooks
- Error handling with try-catch and user feedback
- Loading states for async operations

## License

MIT
