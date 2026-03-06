import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Refresh token logic ────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve()
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const isAuthEndpoint = [
      '/auth/login/',
      '/auth/refresh-token/',
      '/auth/me/',
      '/auth/request-admin/',
      '/auth/forgot-password/',
      '/auth/reset-password/',
      '/auth/verify-email/',
      '/auth/invitations/validate/',
    ].some(path => original.url?.includes(path));

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original)).catch(err => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${API_BASE_URL}/auth/refresh-token/`,
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  getCurrentUser: () => api.get('/auth/me/'),
  verifyInvitation: (token) => api.post('/auth/invitations/validate/', { token }),
  registerWithInvitation: (userData) => api.post('/auth/register/', userData),
  verifyEmail: (token) => api.post('/auth/verify-email/', { token }),
};

export const invitationsAPI = {
  verifyInvitation: (token) => authAPI.verifyInvitation(token),
  registerWithInvitation: (userData) => authAPI.registerWithInvitation(userData),
};

// ─── Admin ──────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/auth/admin/stats/').then(res => res.data),
  getUsers: (params = {}) => api.get('/auth/admin/users/', { params }).then(res => res.data),
  getRecentActivity: (params = {}) => api.get('/auth/admin/activity/', { params }).then(res => res.data),
  getUserById: (id) => api.get(`/auth/admin/users/${id}/`).then(res => res.data),
  updateUser: (id, data) => api.put(`/auth/admin/users/${id}/`, data).then(res => res.data),
  deleteUser: (id) => api.delete(`/auth/admin/users/${id}/delete/`).then(res => res.data),
  activateUser: (id) => api.post(`/auth/admin/users/${id}/activate/`).then(res => res.data),
  suspendUser: (id) => api.post(`/auth/admin/users/${id}/suspend/`).then(res => res.data),
  getInvitations: (params = {}) =>
    api.get('/auth/admin/invitations/', { params }).then(res => {
      if (res.data?.invitations) return res.data.invitations;
      if (Array.isArray(res.data)) return res.data;
      if (res.data?.data) return res.data.data;
      return res.data;
    }),
  createInvitation: (data) =>
    api.post('/auth/admin/invitations/create/', data).then(res => res.data),
  revokeInvitation: (id) =>
    api.post(`/auth/admin/invitations/${id}/`).then(res => res.data),
  copyInvitationToken: (id) =>
    api.get(`/auth/admin/invitations/${id}/token/`).then(res => res.data),
  submitRequest: (data) =>
    api.post('/auth/request-admin/', data).then(res => res.data),
  getAdminRequests: (params = {}) =>
    api.get('/auth/admin/requests/', { params }).then(res => {
      const { data } = res;
      if (Array.isArray(data?.results)) return data;
      console.warn('Formato inesperado en getAdminRequests', data);
      return { count: 0, results: [], pending_count: 0, approved_count: 0, rejected_count: 0 };
    }),
  reviewRequest: (id, data) =>
    api.patch(`/auth/admin/requests/${id}/review/`, data).then(res => res.data),
  getSettings: () => api.get('/auth/admin/settings/').then(res => res.data),
  updateSettings: (data) => api.patch('/auth/admin/settings/', data).then(res => res.data),
  backupDatabase: () => api.post('/auth/admin/db/backup/').then(res => res.data),
  optimizeDatabase: () => api.post('/auth/admin/db/optimize/').then(res => res.data),
  cleanExpiredInvitations: () =>
    api.post('/auth/admin/db/clean-expired-invitations/').then(res => res.data),
};

// ─── Bibliografía ───────────────────────────────────────────────────────────
export const bibliographyAPI = {
  list: () => api.get('/bibliography/list/'),
  upload: (formData) =>
    api.post('/bibliography/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  download: (id) => api.get(`/bibliography/download/${id}/`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/bibliography/delete/${id}/`),
};

// ─── Árboles ────────────────────────────────────────────────────────────────
export const treeAPI = {
  generate: (data) => api.post('/tree/generate/', data),
  history: (params = {}) => api.get('/tree/history/', { params }),
  detail: (id) => api.get(`/tree/${id}/`),
  download: (id, format) =>
    api.get(`/tree/${id}/download/${format}/`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/tree/${id}/delete/`),
};

// ─── Dashboard: carga en paralelo ───────────────────────────────────────────
/**
 * OPTIMIZACIÓN PRINCIPAL para EST-04:
 * En lugar de que Dashboard.jsx llame primero a treeAPI.history()
 * y luego (cuando resuelve) llame a bibliographyAPI.list(), ambas
 * se lanzan en paralelo con Promise.all.
 *
 * Diferencia práctica:
 *   ANTES: 800ms (trees) + 600ms (biblio) = ~1400ms secuencial
 *   AHORA: max(800ms, 600ms)              = ~800ms paralelo
 *
 * Úsalo en Dashboard.jsx:
 *   const { trees, bibliographies } = await dashboardAPI.loadAll();
 */
export const dashboardAPI = {
  loadAll: async (treeParams = { page_size: 6 }) => {
    const [treesRes, biblioRes] = await Promise.all([
      treeAPI.history(treeParams),
      bibliographyAPI.list(),
    ]);
    return {
      trees: treesRes.data,
      bibliographies: biblioRes.data,
    };
  },
};

export default api;