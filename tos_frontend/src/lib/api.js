import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Reintentar la solicitud original
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // El refresh token también expiró, redirigir al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login/';
      }
    }

    return Promise.reject(error);
  }
);

// ===== API DE AUTENTICACIÓN (EXISTENTE + NUEVOS) =====
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),  // NUEVO
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  getCurrentUser: () => api.get('/auth/user/'),  // NUEVO
  refreshToken: (refreshToken) => api.post('/auth/refresh-token/', { refresh: refreshToken }),
};

// ===== API DE INVITACIONES (NUEVO) =====
export const invitationsAPI = {
  // Verificar token de invitación antes del registro
  verifyInvitation: (token) => api.post('/invitations/validate/', { token }),
  
  // Registrar usuario con invitación
  registerWithInvitation: (userData) => api.post('/register/', userData),
};

// ===== API DE SOLICITUDES DE ADMINISTRADOR (NUEVO) =====
export const adminRequestAPI = {
  // Enviar solicitud para ser administrador
  submitRequest: (requestData) => api.post('/admin-requests/', requestData),
};

// ===== API COMPLETA DE ADMINISTRACIÓN (NUEVO) =====
export const adminAPI = {
  // ===== ESTADÍSTICAS DEL DASHBOARD =====
  // Añadimos .then(res => res.data) para que React Query reciba el JSON directamente
  getStats: () => api.get('auth/admin/stats/').then(res => res.data),
  
  // ===== GESTIÓN DE USUARIOS =====
  getUsers: (params) => api.get('auth/admin/users/', { params }).then(res => res.data),
  
  // Corregido: Si no pasas params, enviamos un objeto vacío para evitar el error [object Object] en la URL
  getRecentActivity: (params = {}) => api.get('auth/admin/activity/', { params }).then(res => res.data),
  
  getUserById: (id) => api.get(`auth/admin/users/${id}/`).then(res => res.data),
  updateUser: (id, data) => api.patch(`auth/admin/users/${id}/`, data).then(res => res.data),
  deleteUser: (id) => api.delete(`auth/admin/users/${id}/`).then(res => res.data),
  
  // Cambiar rol de usuario
  changeUserRole: (id, role) => api.patch(`auth/admin/users/${id}/role/`, { role }).then(res => res.data),
  
  // Cambiar estado de usuario
  changeUserState: (id, state) => api.patch(`auth/admin/users/${id}/state/`, { state }).then(res => res.data),
  
  // ===== GESTIÓN DE INVITACIONES =====
  getInvitations: (params) => api.get('auth/admin/invitations/', { params }).then(res => res.data),
  createInvitation: (data) => api.post('auth/admin/invitations/', data).then(res => res.data),
  revokeInvitation: (id) => api.delete(`auth/admin/invitations/${id}/`).then(res => res.data),
  copyInvitationToken: (id) => api.get(`auth/admin/invitations/${id}/token/`).then(res => res.data),
  
  // ===== GESTIÓN DE SOLICITUDES DE ADMIN =====
  getAdminRequests: (params) => api.get('auth/admin/requests/', { params }).then(res => res.data),
  reviewRequest: (id, data) => api.patch(`auth/admin/requests/${id}/review/`, data).then(res => res.data),
  
  // ===== CONFIGURACIONES DEL SISTEMA =====
  getSettings: () => api.get('auth/admin/settings/').then(res => res.data),
  updateSettings: (data) => api.patch('auth/admin/settings/', data).then(res => res.data),
};

// ===== API DE BIBLIOGRAFÍA (EXISTENTE) =====
export const bibliographyAPI = {
  list: () => api.get('/bibliography/list/'),
  upload: (formData) => api.post('/bibliography/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  download: (id) => api.get(`/bibliography/download/${id}/`, {
    responseType: 'blob',
  }),
  delete: (id) => api.delete(`/bibliography/delete/${id}/`),
};

// ===== API DE ÁRBOLES (EXISTENTE) =====
export const treeAPI = {
  generate: (data) => api.post('/tree/generate/', data),
  history: () => api.get('/tree/history/'),
  detail: (id) => api.get(`/tree/${id}/`),
  download: (id, format) => api.get(`/tree/${id}/download/${format}/`, {
    responseType: 'blob',
  }),
  delete: (id) => api.delete(`/tree/${id}/delete/`),
};

export default api;