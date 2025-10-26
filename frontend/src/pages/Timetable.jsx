import { useState, useEffect } from 'react';
import { timetableAPI, groupsAPI } from '../api/client';
import { Calendar, Play, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import TimetableGrid from '../components/TimetableGrid';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const SLOT_TIMES = [
  { index: 0, start: '08:15', end: '09:45', period: 'morning' },
  { index: 1, start: '10:00', end: '11:30', period: 'morning' },
  { index: 2, start: '11:45', end: '13:15', period: 'morning' },
  { index: 3, start: '15:00', end: '16:30', period: 'afternoon' },
  { index: 4, start: '16:45', end: '18:15', period: 'afternoon' }
];

export default function TimetablePage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [weekRef, setWeekRef] = useState(getCurrentWeek());
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [scope, setScope] = useState('all');
  const [rounding, setRounding] = useState('up');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchTimetable();
    }
  }, [selectedGroup, weekRef]);

  function getCurrentWeek() {
    const date = new Date();
    const onejan = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getAll();
      setGroups(response.data);
      if (response.data.length > 0) {
        setSelectedGroup(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchTimetable = async () => {
    if (!selectedGroup) return;
    
    setLoading(true);
    try {
      const response = await timetableAPI.getByGroup(selectedGroup, weekRef);
      setTimetable(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setTimetable(null);
      } else {
        console.error('Error fetching timetable:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerationResult(null);
    
    try {
      const response = await timetableAPI.generate(
        weekRef,
        scope,
        scope === 'group' ? selectedGroup : null,
        rounding
      );
      setGenerationResult(response.data);
      
      // Refresh the timetable after generation
      setTimeout(() => {
        fetchTimetable();
      }, 500);
    } catch (error) {
      console.error('Error generating timetable:', error);
      alert('Failed to generate timetable: ' + (error.response?.data?.message || error.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteTimetable = async () => {
    if (!confirm('Are you sure you want to delete this timetable?')) return;
    
    try {
      await timetableAPI.delete(selectedGroup, weekRef);
      setTimetable(null);
    } catch (error) {
      console.error('Error deleting timetable:', error);
      alert('Failed to delete timetable');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-900 pb-4">
        Timetable Generator
      </h1>

      {/* Controls */}
      <div className="bg-white border-2 border-gray-900 p-6">
        <h2 className="text-lg font-bold mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">
              Week
            </label>
            <input
              type="week"
              value={weekRef}
              onChange={(e) => setWeekRef(e.target.value.replace('-W', '-W'))}
              className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Group
            </label>
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
            >
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Scope
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
            >
              <option value="all">All Groups</option>
              <option value="group">Selected Group</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Rounding
            </label>
            <select
              value={rounding}
              onChange={(e) => setRounding(e.target.value)}
              className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
            >
              <option value="up">Round Up</option>
              <option value="down">Round Down</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold disabled:bg-gray-400"
          >
            {generating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate Timetable
              </>
            )}
          </button>

          {timetable && (
            <button
              onClick={handleDeleteTimetable}
              className="inline-flex items-center bg-white text-gray-900 hover:bg-gray-100 border-2 border-gray-900 px-4 py-2 font-bold"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Timetable
            </button>
          )}
        </div>

        {generationResult && (
          <div className={`mt-4 p-4 border-2 ${
            generationResult.stats.unplacedDemands === 0
              ? 'bg-green-50 border-gray-900'
              : 'bg-yellow-50 border-gray-900'
          }`}>
            <div className="flex items-start">
              {generationResult.stats.unplacedDemands === 0 ? (
                <CheckCircle className="h-5 w-5 text-gray-900 mt-0.5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-gray-900 mt-0.5 mr-2" />
              )}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Generation Complete
                </h3>
                <p className="text-sm text-gray-700">
                  Placed: {generationResult.stats.placedSessions} / {generationResult.stats.totalDemands} sessions
                </p>
                {generationResult.stats.unplacedDemands > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      Unplaced sessions:
                    </p>
                    <ul className="text-sm text-gray-700 list-disc list-inside">
                      {generationResult.unplacedDemands.map((demand, idx) => (
                        <li key={idx}>
                          {demand.subject} ({demand.type}) - {demand.groups.join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timetable Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white border-2 border-gray-900">
          <div className="text-gray-900 font-bold">Loading timetable...</div>
        </div>
      ) : timetable ? (
        <TimetableGrid
          timetable={timetable}
          weekRef={weekRef}
          onUpdate={fetchTimetable}
        />
      ) : (
        <div className="bg-white border-2 border-gray-900 p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-900 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No timetable found
          </h3>
          <p className="text-gray-700 mb-4">
            Generate a timetable for this group and week to get started.
          </p>
        </div>
      )}
    </div>
  );
}
