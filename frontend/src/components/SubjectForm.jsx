import { useState, useEffect } from 'react';
import { subjectsAPI, teachersAPI, groupsAPI } from '../api/client';
import { X } from 'lucide-react';

export default function SubjectForm({ subject, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    weeklyHours: 3,
    type: 'CM',
    slotsPerSession: 1,
    teacherId: '',
    groupIds: []
  });
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchGroups();
    
    if (subject) {
      setFormData({
        name: subject.name,
        code: subject.code,
        weeklyHours: subject.weeklyHours,
        type: subject.type,
        slotsPerSession: subject.slotsPerSession,
        teacherId: subject.teacherId?._id || subject.teacherId || '',
        groupIds: subject.groupIds?.map(g => g._id || g) || []
      });
    }
  }, [subject]);

  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getAll();
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getAll();
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleTypeChange = (type) => {
    const newData = { ...formData, type };
    if (type === 'TP') {
      newData.slotsPerSession = 2;
    }
    setFormData(newData);
  };

  const handleGroupToggle = (groupId) => {
    const newGroupIds = formData.groupIds.includes(groupId)
      ? formData.groupIds.filter(id => id !== groupId)
      : [...formData.groupIds, groupId];
    setFormData({ ...formData, groupIds: newGroupIds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.teacherId) {
      alert('Please select a teacher');
      return;
    }
    
    if (formData.groupIds.length === 0) {
      alert('Please select at least one group');
      return;
    }
    
    setSaving(true);

    try {
      if (subject) {
        await subjectsAPI.update(subject._id, formData);
      } else {
        await subjectsAPI.create(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving subject:', error);
      alert('Failed to save subject: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 border-2 border-gray-900 bg-white mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{subject ? 'Edit Subject' : 'Add New Subject'}</h3>
        <button onClick={onClose} className="text-gray-900 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
            />
          </div>

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
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
            >
              <option value="CM">CM (Lecture)</option>
              <option value="TD">TD (Tutorial)</option>
              <option value="TP">TP (Practical)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Weekly Hours *</label>
            <input
              type="number"
              min="1.5"
              step="0.5"
              required
              value={formData.weeklyHours}
              onChange={(e) => setFormData({ ...formData, weeklyHours: parseFloat(e.target.value) })}
              className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Slots/Session</label>
            <input
              type="number"
              min="1"
              max="2"
              value={formData.slotsPerSession}
              onChange={(e) => setFormData({ ...formData, slotsPerSession: parseInt(e.target.value) })}
              disabled={formData.type === 'TP'}
              className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900 disabled:bg-gray-100"
            />
            {formData.type === 'TP' && (
              <p className="text-xs text-gray-600 mt-1">TP always uses 2 slots (3h)</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Teacher *</label>
          <select
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            required
            className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
          >
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Groups * (select at least one)</label>
          <div className="border-2 border-gray-900 p-3 max-h-40 overflow-y-auto">
            {groups.map((group) => (
              <label key={group._id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={formData.groupIds.includes(group._id)}
                  onChange={() => handleGroupToggle(group._id)}
                  className="h-4 w-4 border-2 border-gray-900"
                />
                <span className="ml-2 text-sm">
                  {group.name} ({group.size} students)
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold"
          >
            {saving ? 'Saving...' : subject ? 'Update Subject' : 'Save Subject'}
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
