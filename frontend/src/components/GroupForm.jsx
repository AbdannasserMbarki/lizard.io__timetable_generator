import { useState, useEffect } from 'react';
import { groupsAPI } from '../api/client';
import { X } from 'lucide-react';

export default function GroupForm({ group, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    size: 30,
    specialty: '',
    year: 3
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        size: group.size,
        specialty: group.specialty,
        year: group.year
      });
    }
  }, [group]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (group) {
        await groupsAPI.update(group._id, formData);
      } else {
        await groupsAPI.create(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Failed to save group: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 border-2 border-gray-900 bg-white mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{group ? 'Edit Group' : 'Add New Group'}</h3>
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
            placeholder="e.g., L3-INFO-A"
            className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Specialty *</label>
          <input
            type="text"
            required
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            placeholder="e.g., Computer Science"
            className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Year *</label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
            >
              <option value={1}>Year 1</option>
              <option value={2}>Year 2</option>
              <option value={3}>Year 3</option>
              <option value={4}>Year 4</option>
              <option value={5}>Year 5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Size *</label>
            <input
              type="number"
              min="1"
              required
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
              className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold"
          >
            {saving ? 'Saving...' : group ? 'Update Group' : 'Save Group'}
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
