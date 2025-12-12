import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Vecinos
export const vecinosAPI = {
  getAll: () => api.get('/vecinos'),
  // Devolvemos directamente data para facilitar el uso en UI
  getById: async (id) => (await api.get(`/vecinos/${id}`)).data,
  // Devolvemos directamente data para evitar manejar AxiosResponse en el UI
  findByDocumento: async (documento) =>
    (await api.get(`/vecinos/por-documento/${encodeURIComponent(documento)}`)).data,
  search: (query) => api.get(`/vecinos/search?q=${encodeURIComponent(query)}`),
  create: (data) => api.post('/vecinos', data),
  update: (id, data) => api.put(`/vecinos/${id}`, data),
  delete: (id) => api.delete(`/vecinos/${id}`),
  toggleActivo: (id) => api.patch(`/vecinos/${id}/toggle-activo`),
  getEventos: (id) => api.get(`/vecinos/${id}/eventos`),
};

// Eventos
export const eventosAPI = {
  getAll: () => api.get('/eventos'),
  getActive: () => api.get('/eventos/activos'),
  getById: (id) => api.get(`/eventos/${id}`),
  create: (data) => api.post('/eventos', data),
  update: (id, data) => api.put(`/eventos/${id}`, data),
  delete: (id) => api.delete(`/eventos/${id}`),
  toggleActivo: (id) => api.patch(`/eventos/${id}/toggle-activo`),
  getVecinos: (id) => api.get(`/eventos/${id}/vecinos`),
};

// Registros
export const registrosAPI = {
  getAll: () => api.get('/registros'),
  getById: (id) => api.get(`/registros/${id}`),
  create: (data) => api.post('/registros', data),
  registerByDocumento: (data) => api.post('/registros/por-documento', data),
  delete: (id) => api.delete(`/registros/${id}`),
};

// Subsecretarias
export const subsecretariasAPI = {
  getAll: () => api.get('/subsecretarias'),
  getById: (id) => api.get(`/subsecretarias/${id}`),
  search: (query) => api.get(`/subsecretarias/search?q=${encodeURIComponent(query)}`),
  create: (data) => api.post('/subsecretarias', data),
  update: (id, data) => api.put(`/subsecretarias/${id}`, data),
  delete: (id) => api.delete(`/subsecretarias/${id}`),
};

// Tipos
export const tiposAPI = {
  getAll: () => api.get('/tipos'),
  getById: (id) => api.get(`/tipos/${id}`),
  search: (query) => api.get(`/tipos/search?q=${encodeURIComponent(query)}`),
  create: (data) => api.post('/tipos', data),
  update: (id, data) => api.put(`/tipos/${id}`, data),
  delete: (id) => api.delete(`/tipos/${id}`),
  getSubtipos: (id) => api.get(`/tipos/${id}/subtipos`),
};

// Subtipos
export const subtiposAPI = {
  getAll: () => api.get('/subtipos'),
  getById: (id) => api.get(`/subtipos/${id}`),
  getByTipo: (tipoId) => api.get(`/subtipos/tipo/${tipoId}`),
  search: (query) => api.get(`/subtipos/search?q=${encodeURIComponent(query)}`),
  create: (data) => api.post('/subtipos', data),
  update: (id, data) => api.put(`/subtipos/${id}`, data),
  delete: (id) => api.delete(`/subtipos/${id}`),
};

// Autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.get('/auth/verify'),
  getAllUsers: () => api.get('/auth/users'),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  toggleUserActivo: (id) => api.patch(`/auth/users/${id}/toggle-activo`),
};

export default api;

