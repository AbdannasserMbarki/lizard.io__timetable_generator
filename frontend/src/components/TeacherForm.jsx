import { useState, useEffect } from 'react';
import { teachersAPI } from '../api/client';
import { X } from 'lucide-react';

export default function TeacherForm({ teacher, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    maxLoadPerWeek: 20
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name,
        email: teacher.email,
        maxLoadPerWeek: teacher.maxLoadPerWeek
      });
    }
  }, [teacher]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (teacher) {
        await teachersAPI.update(teacher._id, formData);
      } else {
        await teachersAPI.create(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert('Failed to save teacher: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 border-2 border-gray-900 bg-white mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{teacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
        <button onClick={onClose} className="text-gray-900 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Max Load Per Week (hours)</label>
          <input
            type="number"
            min="1"
            max="40"
            value={formData.maxLoadPerWeek}
            onChange={(e) => setFormData({ ...formData, maxLoadPerWeek: parseInt(e.target.value) })}
            className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold"
          >
            {saving ? 'Saving...' : teacher ? 'Update Teacher' : 'Save Teacher'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-white text-gray-900 hover:bg-gray-100 border-2 border-gray-900 px-4 py-2 font-bold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
