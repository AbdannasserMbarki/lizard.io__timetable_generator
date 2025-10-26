import { useState, useEffect } from 'react';
import { roomsAPI } from '../api/client';
import { X } from 'lucide-react';

export default function RoomForm({ room, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    capacity: 30,
    equipment: [],
    typesAllowed: []
  });
  const [equipmentInput, setEquipmentInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        capacity: room.capacity,
        equipment: room.equipment || [],
        typesAllowed: room.typesAllowed || []
      });
    }
  }, [room]);

  const handleTypeToggle = (type) => {
    const newTypes = formData.typesAllowed.includes(type)
      ? formData.typesAllowed.filter(t => t !== type)
      : [...formData.typesAllowed, type];
    setFormData({ ...formData, typesAllowed: newTypes });
  };

  const addEquipment = () => {
    const trimmed = equipmentInput.trim();
    if (trimmed && !formData.equipment.includes(trimmed)) {
      setFormData({ ...formData, equipment: [...formData.equipment, trimmed] });
      setEquipmentInput('');
    }
  };

  const removeEquipment = (item) => {
    setFormData({ 
      ...formData, 
      equipment: formData.equipment.filter(e => e !== item) 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.typesAllowed.length === 0) {
      alert('Please select at least one session type');
      return;
    }
    
    setSaving(true);

    try {
      if (room) {
        await roomsAPI.update(room._id, formData);
      } else {
        await roomsAPI.create(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Failed to save room: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 border-2 border-gray-900 bg-white mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{room ? 'Edit Room' : 'Add New Room'}</h3>
        <button onClick={onClose} className="text-gray-900 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">Room Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Capacity *</label>
          <input
            type="number"
            min="1"
            required
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            className="w-full border-2 border-gray-900 p-2 bg-white text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Types Allowed *</label>
          <div className="flex gap-3">
            {['CM', 'TD', 'TP'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.typesAllowed.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                  className="h-4 w-4 border-2 border-gray-900"
                />
                <span className="ml-2 text-sm font-bold">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Equipment</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={equipmentInput}
              onChange={(e) => setEquipmentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
              placeholder="e.g., Projector, Whiteboard, Computers"
              className="flex-1 border-2 border-gray-900 p-2 bg-white text-gray-900"
            />
            <button
              type="button"
              onClick={addEquipment}
              className="px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-100 font-bold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.equipment.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-3 py-1 border-2 border-gray-900 bg-white text-gray-900"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeEquipment(item)}
                  className="ml-2 text-gray-900 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold"
          >
            {room ? 'Update Room' : 'Save Room'}
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
