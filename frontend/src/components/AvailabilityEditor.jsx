import { useState, useEffect } from 'react';
import { teachersAPI } from '../api/client';
import { X, Check, X as XIcon, Minus } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = ['morning', 'afternoon'];

export default function AvailabilityEditor({ teacher, onClose, onSave, selfService = false }) {
  const [preferences, setPreferences] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (teacher) {
      setPreferences(teacher.preferences || getDefaultPreferences());
      setAvailability(teacher.availability || getDefaultAvailability());
    }
  }, [teacher]);

  function getDefaultPreferences() {
    const prefs = {};
    DAYS.forEach(day => {
      prefs[day] = { morning: 'neutral', afternoon: 'neutral' };
    });
    // Wednesday afternoon default to neutral (user can choose)
    return prefs;
  }

  function getDefaultAvailability() {
    const avail = {};
    DAYS.forEach(day => {
      if (day === 'wednesday') {
        avail[day] = { morning: true, afternoon: false }; // Wednesday afternoon excluded
      } else {
        avail[day] = { morning: true, afternoon: true };
      }
    });
    return avail;
  }

  const handlePreferenceChange = (day, period, value) => {
    setPreferences({
      ...preferences,
      [day]: {
        ...preferences[day],
        [period]: value
      }
    });
  };

  const handleAvailabilityToggle = (day, period) => {
    // Don't allow changing Wednesday afternoon (hard constraint)
    if (day === 'wednesday' && period === 'afternoon') return;
    
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        [period]: !availability[day][period]
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selfService && onSave) {
        // Self-service mode: use provided onSave callback
        await onSave({ preferences, availability });
      } else {
        // Admin mode: use API client
        await teachersAPI.updatePreferences(teacher._id, {
          preferences,
          availability
        });
      }
      if (onClose && !selfService) onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (!preferences || !availability) return null;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
              {/* Availability Grid */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  Availability (Hard Constraints)
                </h4>
                <p className="text-xs text-gray-700 mb-3">
                  Green = Available, Red = Blocked (hard constraint). Wednesday afternoon is always excluded.
                </p>
                <div className="border-2 border-gray-900 overflow-hidden">
                  <table className="min-w-full divide-y-2 divide-gray-900">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase border-b-2 border-gray-900">
                          Day
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-bold text-gray-900 uppercase border-b-2 border-gray-900">
                          Morning
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-bold text-gray-900 uppercase border-b-2 border-gray-900">
                          Afternoon
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y-2 divide-gray-900">
                      {DAYS.map((day, idx) => (
                        <tr key={day}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {DAY_LABELS[idx]}
                          </td>
                          {PERIODS.map(period => {
                            const isAvailable = availability[day][period];
                            const isWednesdayPM = day === 'wednesday' && period === 'afternoon';
                            return (
                              <td key={period} className="px-4 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleAvailabilityToggle(day, period)}
                                  disabled={isWednesdayPM}
                                  className={`inline-flex items-center justify-center w-20 px-3 py-1 border-2 text-sm font-bold ${
                                    isAvailable
                                      ? 'bg-green-50 text-gray-900 border-gray-900 hover:bg-green-100'
                                      : 'bg-red-50 text-gray-900 border-gray-900 hover:bg-red-100'
                                  } ${isWednesdayPM ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {isAvailable ? (
                                    <><Check className="h-3 w-3 mr-1" /> Yes</>
                                  ) : (
                                    <><XIcon className="h-3 w-3 mr-1" /> No</>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Preferences Grid */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  Preferences (Soft Constraints)
                </h4>
                <p className="text-xs text-gray-700 mb-3">
                  Choose your preference for each time slot. Only available slots can have preferences.
                </p>
                <div className="border-2 border-gray-900 overflow-hidden">
                  <table className="min-w-full divide-y-2 divide-gray-900">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase border-b-2 border-gray-900">
                          Day
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-bold text-gray-900 uppercase border-b-2 border-gray-900">
                          Morning
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-bold text-gray-900 uppercase border-b-2 border-gray-900">
                          Afternoon
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y-2 divide-gray-900">
                      {DAYS.map((day, idx) => (
                        <tr key={day}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {DAY_LABELS[idx]}
                          </td>
                          {PERIODS.map(period => {
                            const pref = preferences[day][period];
                            const isAvailable = availability[day][period];
                            return (
                              <td key={period} className="px-4 py-2 text-center">
                                <select
                                  value={pref}
                                  onChange={(e) => handlePreferenceChange(day, period, e.target.value)}
                                  disabled={!isAvailable}
                                  className={`px-2 py-1 border-2 text-sm font-bold ${
                                    !isAvailable ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-400' :
                                    pref === 'prefer' ? 'bg-green-50 text-gray-900 border-gray-900' :
                                    pref === 'avoid' ? 'bg-red-50 text-gray-900 border-gray-900' :
                                    'bg-white text-gray-900 border-gray-900'
                                  }`}
                                >
                                  <option value="prefer">Prefer</option>
                                  <option value="neutral">Neutral</option>
                                  <option value="avoid">Avoid</option>
                                </select>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

      <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-900">
        {!selfService && (
          <button
            type="button"
            onClick={onClose}
            className="bg-white text-gray-900 hover:bg-gray-100 border-2 border-gray-900 px-4 py-2 font-bold"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );

  // Self-service mode - embedded in page
  if (selfService) {
    return (
      <div className="bg-white border-2 border-gray-900 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Preferences & Availability
          </h3>
          <p className="text-sm text-gray-700 mt-1">Set your teaching preferences and availability</p>
        </div>
        {formContent}
      </div>
    );
  }

  // Modal mode - for admin
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white border-4 border-gray-900 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Preferences & Availability
                </h3>
                <p className="text-sm text-gray-700 mt-1">{teacher.name}</p>
              </div>
              <button onClick={onClose} className="text-gray-900 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            {formContent}
          </div>
        </div>
      </div>
    </div>
  );
}
