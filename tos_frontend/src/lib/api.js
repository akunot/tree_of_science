import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

 // ===== API DE AUTENTICACIÓN =====
 export const authAPI = {
   register: (userData) => api.post('/auth/register/', userData),
   login: (credentials) => api.post('/auth/login/', credentials),
   logout: () => api.post('/auth/logout/'),
   forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
   resetPassword: (data) => api.post('/auth/reset-password/', data),
   getCurrentUser: () => api.get('/auth/user/'),
   refreshToken: (refreshToken) => api.post('/auth/refresh-token/', { refresh: refreshToken }),

   // === INVITACIONES (usadas en Register.jsx) ===
   verifyInvitation: (token) => api.post('/auth/invitations/validate/', { token }),
   registerWithInvitation: (userData) => api.post('/auth/register/', userData),

   // === VERIFICACIÓN DE EMAIL ===
   verifyEmail: (token) => api.post('/auth/verify-email/', { token }),
 };

 // ===== API DE INVITACIONES (si quieres mantenerla) =====
 export const invitationsAPI = {
   verifyInvitation: (token) => authAPI.verifyInvitation(token),
   registerWithInvitation: (userData) => authAPI.registerWithInvitation(userData),
 };

// ===== API DE SOLICITUDES DE ADMINISTRADOR =====
export const adminAPI = {
  // ===== ESTADÍSTICAS DEL DASHBOARD =====
  getStats: () => api.get('/auth/admin/stats/').then(res => res.data),
  
  // ===== GESTIÓN DE USUARIOS =====
  getUsers: (params = {}) => api.get('/auth/admin/users/', { params }).then(res => res.data),
  getRecentActivity: (params = {}) => api.get('/auth/admin/activity/', { params }).then(res => res.data),
  getUserById: (id) => api.get(`/auth/admin/users/${id}/`).then(res => res.data),
  updateUser: (id, data) => api.put(`/auth/admin/users/${id}/`, data).then(res => res.data),
  deleteUser: (id) => api.delete(`/auth/admin/users/${id}/delete/`).then(res => res.data),

  // Activar y suspender usuarios con los endpoints correctos
  activateUser: (id) => api.post(`/auth/admin/users/${id}/activate/`).then(res => res.data),
  suspendUser: (id) => api.post(`/auth/admin/users/${id}/suspend/`).then(res => res.data),
  
  // ===== GESTIÓN DE INVITACIONES =====
  // getInvitations - asegurar que retorna array
  getInvitations: (params = {}) => 
    api.get('/auth/admin/invitations/', { params }).then(res => {
      // Si el servidor retorna { invitations: [...] }, extraer el array
      if (res.data?.invitations) {
        return res.data.invitations;
      }
      // Si retorna directamente un array, usarlo así
      if (Array.isArray(res.data)) {
        return res.data;
      }
      // Si retorna un objeto con data, usar eso
      if (res.data?.data) {
        return res.data.data;
      }
      // Fallback: retornar el objeto completo para debugging
      return res.data;
    }),
  
  // createInvitation
  createInvitation: (data) =>
    api.post('/auth/admin/invitations/create/', data).then(res => res.data),
  
  revokeInvitation: (id) => 
    api.post(`/auth/admin/invitations/${id}/`).then(res => res.data),
  
  copyInvitationToken: (id) => 
    api.get(`/auth/admin/invitations/${id}/token/`).then(res => res.data),
  
    // ===== GESTIÓN DE SOLICITUDES DE ADMIN =====

  // Enviar una nueva solicitud de acceso de administrador (lo usa AdminRequest.jsx)
  submitRequest: (data) =>
    api.post('/auth/request-admin/', data).then(res => res.data),

  // Listar solicitudes para el panel de administración
  getAdminRequests: (params = {}) => 
    api.get('/auth/admin/requests/', { params }).then(res => {
      const {data} = res;
      // Tu backend devuelve { count, results, pending_count, ... }
      if (Array.isArray(data?.results)) {
        return data;
      }
      console.warn('Formato inesperado en getAdminRequests, devolviendo estructura vacía', data);
      return { count: 0, results: [], pending_count: 0, approved_count: 0, rejected_count: 0 };
    }),

  // Aprobar / rechazar una solicitud
  reviewRequest: (id, data) => 
    api.patch(`/auth/admin/requests/${id}/review/`, data).then(res => res.data),
  
  // ===== CONFIGURACIONES DEL SISTEMA =====
  getSettings: () => 
    api.get('/auth/admin/settings/').then(res => res.data),
  
  updateSettings: (data) => 
    api.patch('/auth/admin/settings/', data).then(res => res.data),

  // ===== HERRAMIENTAS DE BASE DE DATOS =====
  backupDatabase: () =>
    api.post('/auth/admin/db/backup/').then(res => res.data),

  optimizeDatabase: () =>
    api.post('/auth/admin/db/optimize/').then(res => res.data),

  cleanExpiredInvitations: () =>
    api.post('/auth/admin/db/clean-expired-invitations/').then(res => res.data),
};

// ===== API DE BIBLIOGRAFÍA =====
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

// ===== API DE ÁRBOLES =====
export const treeAPI = {
  generate: (data) => api.post('/tree/generate/', data),

  // Historial paginado con parámetros opcionales (page, page_size, search)
  history: (params = {}) => api.get('/tree/history/', { params }),

  detail: (id) => api.get(`/tree/${id}/`),
  download: (id, format) => api.get(`/tree/${id}/download/${format}/`, {
    responseType: 'blob',
  }),
  delete: (id) => api.delete(`/tree/${id}/delete/`),
};

export default api;