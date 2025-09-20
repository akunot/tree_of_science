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
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API de autenticación
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
};

// API de bibliografía
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

// API de árboles
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

