import { useState } from 'react';
import { timetableAPI } from '../api/client';
import { Clock, MapPin, Users, BookOpen } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SLOT_TIMES = [
  { index: 0, start: '08:15', end: '09:45', period: 'morning' },
  { index: 1, start: '10:00', end: '11:30', period: 'morning' },
  { index: 2, start: '11:45', end: '13:15', period: 'morning' },
  { index: 3, start: '15:00', end: '16:30', period: 'afternoon' },
  { index: 4, start: '16:45', end: '18:15', period: 'afternoon' }
];

export default function TimetableGrid({ timetable, weekRef, onUpdate }) {
  const [selectedSession, setSelectedSession] = useState(null);

  // Organize sessions by day and slot
  const sessionGrid = {};
  DAYS.forEach(day => {
    sessionGrid[day] = {};
  });

  if (timetable && timetable.sessions) {
    timetable.sessions.forEach(session => {
      const day = session.day;
      const startIndex = session.startSlotIndex;
      
      // For 2-slot sessions, mark both slots
      sessionGrid[day][startIndex] = session;
      if (session.slotCount === 2) {
        sessionGrid[day][startIndex + 1] = { ...session, isContinuation: true };
      }
    });
  }

  const getSessionColor = (type) => {
    switch (type) {
      case 'CM': return 'bg-blue-50 border-gray-900 text-gray-900';
      case 'TD': return 'bg-green-50 border-gray-900 text-gray-900';
      case 'TP': return 'bg-purple-50 border-gray-900 text-gray-900';
      default: return 'bg-gray-50 border-gray-900 text-gray-900';
    }
  };

  const SessionCard = ({ session }) => {
    if (!session || session.isContinuation) return null;

    const colorClass = getSessionColor(session.type);
    const height = session.slotCount === 2 ? 'row-span-2' : '';

    return (
      <div
        onClick={() => setSelectedSession(session)}
        className={`${colorClass} ${height} p-2 border-2 cursor-pointer hover:bg-gray-100 text-xs`}
      >
        <div className="font-bold mb-1">
          {session.subjectId?.code || 'N/A'}
        </div>
        <div className="text-xs opacity-90 space-y-0.5">
          <div className="flex items-center">
            <BookOpen className="h-3 w-3 mr-1" />
            {session.subjectId?.name || 'N/A'}
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {session.teacherId?.name || 'N/A'}
          </div>
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {session.roomId?.name || 'N/A'}
          </div>
        </div>
        {session.slotCount === 2 && (
          <div className="mt-1 text-xs font-medium">
            3h (TP)
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Grid */}
      <div className="bg-white border-2 border-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-900">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider w-24">
                  Time
                </th>
                {DAY_LABELS.map((label, idx) => (
                  <th
                    key={DAYS[idx]}
                    className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider min-w-[160px]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-900">
              {SLOT_TIMES.map((slot) => (
                <tr key={slot.index} className="h-24 border-b border-gray-900">
                  <td className="sticky left-0 z-10 bg-white px-4 py-2 text-xs text-gray-900 border-r-2 border-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-gray-400" />
                      <div>
                        <div className="font-medium">{slot.start}</div>
                        <div className="text-gray-500">{slot.end}</div>
                      </div>
                    </div>
                  </td>
                  {DAYS.map(day => {
                    const session = sessionGrid[day][slot.index];
                    const isWednesdayAfternoon = day === 'wednesday' && slot.period === 'afternoon';
                    
                    return (
                      <td
                        key={day}
                        className={`px-2 py-2 align-top ${
                          isWednesdayAfternoon ? 'bg-gray-100' : ''
                        }`}
                      >
                        {isWednesdayAfternoon ? (
                          <div className="text-xs text-gray-500 text-center py-4">
                            Excluded
                          </div>
                        ) : session && !session.isContinuation ? (
                          <SessionCard session={session} />
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border-2 border-gray-900 p-4">
        <h4 className="text-sm font-bold text-gray-900 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 border-2 border-gray-900 mr-2"></div>
            <span className="text-sm text-gray-700">CM (Lecture)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-50 border-2 border-gray-900 mr-2"></div>
            <span className="text-sm text-gray-700">TD (Tutorial)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-50 border-2 border-gray-900 mr-2"></div>
            <span className="text-sm text-gray-700">TP (Practical - 3h)</span>
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setSelectedSession(null)}
            ></div>

            <div className="inline-block align-bottom bg-white border-4 border-gray-900 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Session Details
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-bold border-2 border-gray-900 ${
                    selectedSession.type === 'CM' ? 'bg-blue-50 text-gray-900' :
                    selectedSession.type === 'TD' ? 'bg-green-50 text-gray-900' :
                    'bg-purple-50 text-gray-900'
                  }`}>
                    {selectedSession.type}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-bold text-gray-700">Subject</label>
                    <div className="text-base text-gray-900">
                      {selectedSession.subjectId?.code} - {selectedSession.subjectId?.name}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700">Teacher</label>
                    <div className="text-base text-gray-900">
                      {selectedSession.teacherId?.name}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700">Room</label>
                    <div className="text-base text-gray-900">
                      {selectedSession.roomId?.name} (Capacity: {selectedSession.roomId?.capacity})
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700">Groups</label>
                    <div className="text-base text-gray-900">
                      {selectedSession.groupIds?.map(g => g.name).join(', ')}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700">Time</label>
                    <div className="text-base text-gray-900">
                      {DAY_LABELS[DAYS.indexOf(selectedSession.day)]}, {SLOT_TIMES[selectedSession.startSlotIndex]?.start} - {
                        selectedSession.slotCount === 2
                          ? SLOT_TIMES[selectedSession.startSlotIndex + 1]?.end
                          : SLOT_TIMES[selectedSession.startSlotIndex]?.end
                      }
                      {selectedSession.slotCount === 2 && ' (3 hours)'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
