import { useState, useEffect } from 'react';
import { teachersAPI } from '../api/client';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';
import TeacherForm from '../components/TeacherForm';
import AvailabilityEditor from '../components/AvailabilityEditor';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showPreferences, setShowPreferences] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getAll();
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      await teachersAPI.delete(id);
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Failed to delete teacher');
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTeacher(null);
    fetchTeachers();
  };

  const handleShowPreferences = (teacher) => {
    setShowPreferences(teacher);
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
      <h2 className="text-3xl font-bold mb-8 border-b-2 border-gray-900 pb-4">Teacher Management</h2>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Teacher'}
        </button>
      </div>

      {showForm && (
        <TeacherForm
          teacher={editingTeacher}
          onClose={handleCloseForm}
        />
      )}

      {showPreferences && (
        <AvailabilityEditor
          teacher={showPreferences}
          onClose={() => setShowPreferences(null)}
        />
      )}

      <div className="space-y-4">
        {teachers.length === 0 ? (
          <div className="p-6 border-2 border-gray-900 bg-white text-center">
            <p className="text-gray-600">No teachers found. Add one to get started.</p>
          </div>
        ) : (
          teachers.map((teacher) => (
            <div key={teacher._id} className="p-4 border-2 border-gray-900 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{teacher.name}</h3>
                  <p className="text-sm mt-1">{teacher.email}</p>
                  <p className="text-sm mt-1">Max Load: {teacher.maxLoadPerWeek}h/week</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShowPreferences(teacher)}
                    className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold"
                  >
                    Preferences
                  </button>
                  <button
                    onClick={() => handleEdit(teacher)}
                    className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(teacher._id)}
                    className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
