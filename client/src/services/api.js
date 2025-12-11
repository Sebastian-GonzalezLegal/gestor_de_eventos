import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Usuarios
export const usuariosAPI = {
  getAll: () => api.get('/usuarios'),
  // Devolvemos directamente data para facilitar el uso en UI
  getById: async (id) => (await api.get(`/usuarios/${id}`)).data,
  // Devolvemos directamente data para evitar manejar AxiosResponse en el UI
  findByDocumento: async (documento) =>
    (await api.get(`/usuarios/por-documento/${encodeURIComponent(documento)}`)).data,
  search: (query) => api.get(`/usuarios/search?q=${encodeURIComponent(query)}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
  toggleActivo: (id) => api.patch(`/usuarios/${id}/toggle-activo`),
  getEventos: (id) => api.get(`/usuarios/${id}/eventos`),
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
  getUsuarios: (id) => api.get(`/eventos/${id}/usuarios`),
};

// Registros
export const registrosAPI = {
  getAll: () => api.get('/registros'),
  getById: (id) => api.get(`/registros/${id}`),
  create: (data) => api.post('/registros', data),
  registerByDocumento: (data) => api.post('/registros/por-documento', data),
  delete: (id) => api.delete(`/registros/${id}`),
};

export default api;

