import { Link } from 'react-router-dom';
import { Calendar, Users, BookOpen, DoorOpen, UsersRound } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 pb-4 border-b-4 border-gray-900 inline-block">
          University Timetable Generator
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto mt-8">
          Automated scheduling system with heuristic optimization. 
          1.5-hour slots · TP double-slots · Preference-based placement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/timetable"
          className="bg-white p-6 border-2 border-gray-900 hover:bg-gray-50"
        >
          <Calendar className="h-10 w-10 text-gray-900 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Timetable</h2>
          <p className="text-gray-700">
            Generate and view schedules
          </p>
        </Link>

        <Link
          to="/teachers"
          className="bg-white p-6 border-2 border-gray-900 hover:bg-gray-50"
        >
          <Users className="h-10 w-10 text-gray-900 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Teachers</h2>
          <p className="text-gray-700">
            Manage teachers and preferences
          </p>
        </Link>

        <Link
          to="/subjects"
          className="bg-white p-6 border-2 border-gray-900 hover:bg-gray-50"
        >
          <BookOpen className="h-10 w-10 text-gray-900 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Subjects</h2>
          <p className="text-gray-700">
            Configure courses and hours
          </p>
        </Link>

        <Link
          to="/rooms"
          className="bg-white p-6 border-2 border-gray-900 hover:bg-gray-50"
        >
          <DoorOpen className="h-10 w-10 text-gray-900 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Rooms</h2>
          <p className="text-gray-700">
            Define room capacities
          </p>
        </Link>

        <Link
          to="/groups"
          className="bg-white p-6 border-2 border-gray-900 hover:bg-gray-50"
        >
          <UsersRound className="h-10 w-10 text-gray-900 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Groups</h2>
          <p className="text-gray-700">
            Organize student groups
          </p>
        </Link>

        <div className="bg-gray-900 text-white p-6 border-2 border-gray-900">
          <Calendar className="h-10 w-10 text-white mb-4" />
          <h2 className="text-xl font-bold mb-2">Quick Start</h2>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Add teachers, rooms, groups</li>
            <li>Create subjects with hours</li>
            <li>Set teacher preferences</li>
            <li>Generate timetable</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
