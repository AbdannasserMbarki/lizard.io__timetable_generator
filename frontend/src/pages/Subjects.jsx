import { useState, useEffect } from 'react';
import { subjectsAPI } from '../api/client';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import SubjectForm from '../components/SubjectForm';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await subjectsAPI.delete(id);
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSubject(null);
    fetchSubjects();
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
      <h2 className="text-3xl font-bold mb-8 border-b-2 border-gray-900 pb-4">Subject Management</h2>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Subject'}
        </button>
      </div>

      {showForm && (
        <SubjectForm
          subject={editingSubject}
          onClose={handleCloseForm}
        />
      )}

      <div className="space-y-4">
        {subjects.length === 0 ? (
          <div className="p-6 border-2 border-gray-900 bg-white text-center">
            <p className="text-gray-600">No subjects found. Add one to get started.</p>
          </div>
        ) : (
          subjects.map((subject) => (
            <div key={subject._id} className="p-4 border-2 border-gray-900 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{subject.code}</h3>
                    <span className="inline-flex px-2 py-1 text-xs font-bold border-2 border-gray-900 bg-white">
                      {subject.type}
                    </span>
                  </div>
                  <p className="text-sm">{subject.name}</p>
                  <p className="text-sm mt-1">{subject.weeklyHours}h/week ({subject.weeklySlots} slots)</p>
                  <p className="text-sm mt-1">Teacher: {subject.teacherId?.name || 'N/A'}</p>
                  <p className="text-sm mt-1">Groups: {subject.groupIds?.map(g => g.name).join(', ') || 'N/A'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(subject._id)}
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
