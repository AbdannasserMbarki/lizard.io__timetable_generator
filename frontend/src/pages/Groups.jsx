import { useState, useEffect } from 'react';
import { groupsAPI } from '../api/client';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import GroupForm from '../components/GroupForm';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getAll();
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    try {
      await groupsAPI.delete(id);
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGroup(null);
    fetchGroups();
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
      <h2 className="text-3xl font-bold mb-8 border-b-2 border-gray-900 pb-4">Group Management</h2>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Group'}
        </button>
      </div>

      {showForm && (
        <GroupForm
          group={editingGroup}
          onClose={handleCloseForm}
        />
      )}

      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="p-6 border-2 border-gray-900 bg-white text-center">
            <p className="text-gray-600">No groups found. Add one to get started.</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group._id} className="p-4 border-2 border-gray-900 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{group.name}</h3>
                  <p className="text-sm mt-1">{group.specialty} - Year {group.year}</p>
                  <p className="text-sm mt-1">{group.size} students</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(group)}
                    className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-gray-900 px-4 py-2 font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(group._id)}
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
