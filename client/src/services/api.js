import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  create: (data) => api.post('/subsecretarias', data),
  update: (id, data) => api.put(`/subsecretarias/${id}`, data),
  delete: (id) => api.delete(`/subsecretarias/${id}`),
};

// Tipos
export const tiposAPI = {
  getAll: () => api.get('/tipos'),
  getById: (id) => api.get(`/tipos/${id}`),
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
  create: (data) => api.post('/subtipos', data),
  update: (id, data) => api.put(`/subtipos/${id}`, data),
  delete: (id) => api.delete(`/subtipos/${id}`),
};

export default api;

