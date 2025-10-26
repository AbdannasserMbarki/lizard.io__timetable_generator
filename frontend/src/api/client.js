import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Teachers API
export const teachersAPI = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
  getPreferences: (id) => api.get(`/teachers/${id}/preferences`),
  updatePreferences: (id, data) => api.put(`/teachers/${id}/preferences`, data),
};

// Subjects API
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Rooms API
export const roomsAPI = {
  getAll: () => api.get('/rooms'),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// Groups API
export const groupsAPI = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
};

// Timetable API
export const timetableAPI = {
  generate: (week, scope = 'all', groupId = null, rounding = 'up') => {
    const params = new URLSearchParams({ week, scope, rounding });
    if (groupId) params.append('groupId', groupId);
    return api.post(`/timetable/generate?${params.toString()}`);
  },
  getByGroup: (groupId, week) => api.get(`/timetable/${groupId}/${week}`),
  getByWeek: (week) => api.get(`/timetable/week/${week}`),
  updateSession: (groupId, week, sessionId, data) =>
    api.put(`/timetable/${groupId}/${week}/session/${sessionId}`, data),
  validate: (data) => api.post('/timetable/validate', data),
  delete: (groupId, week) => api.delete(`/timetable/${groupId}/${week}`),
};

export default api;
