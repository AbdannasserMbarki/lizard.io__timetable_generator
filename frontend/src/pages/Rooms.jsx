import { useState, useEffect } from 'react';
import { roomsAPI } from '../api/client';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import RoomForm from '../components/RoomForm';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getAll();
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await roomsAPI.delete(id);
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRoom(null);
    fetchRooms();
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
      <h2 className="text-3xl font-bold mb-8 border-b-2 border-gray-900 pb-4">Room Management</h2>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Room'}
        </button>
      </div>

      {showForm && (
        <RoomForm
          room={editingRoom}
          onClose={handleCloseForm}
        />
      )}

      <div className="space-y-4">
        {rooms.length === 0 ? (
          <div className="p-6 border-2 border-gray-900 bg-white text-center">
            <p className="text-gray-600">No rooms found. Add one to get started.</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room._id} className="p-4 border-2 border-gray-900 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{room.name}</h3>
                  <p className="text-sm mt-1">Capacity: {room.capacity} students</p>
                  <div className="flex gap-2 mt-2">
                    {room.typesAllowed.map((type) => (
                      <span
                        key={type}
                        className="inline-flex px-2 py-1 text-xs font-bold border-2 border-gray-900 bg-white"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm mt-2">
                    Equipment: {room.equipment.length > 0 ? room.equipment.join(', ') : 'None'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room._id)}
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
