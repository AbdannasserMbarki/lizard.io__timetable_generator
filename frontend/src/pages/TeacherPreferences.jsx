import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AvailabilityEditor from '../components/AvailabilityEditor';
import axios from 'axios';

export default function TeacherPreferencesPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get('/api/teachers/me/preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedPreferences) => {
    try {
      await axios.put('/api/teachers/me/preferences', updatedPreferences);
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 border-b-2 border-gray-900 pb-4">
        My Teaching Preferences
      </h2>

      <div className="mb-6 p-4 border-2 border-gray-900 bg-white">
        <p className="text-sm">
          <strong>Name:</strong> {user?.name}
        </p>
        <p className="text-sm">
          <strong>Email:</strong> {user?.email}
        </p>
      </div>

      {preferences && (
        <AvailabilityEditor
          teacher={{
            ...user?.teacher,
            preferences: preferences.preferences,
            availability: preferences.availability
          }}
          onClose={() => {}}
          onSave={handleSave}
          selfService={true}
        />
      )}
    </div>
  );
}
