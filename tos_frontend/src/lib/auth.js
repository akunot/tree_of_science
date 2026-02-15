import { jwtDecode } from 'jwt-decode';

// ===== FUNCIONES DE VALIDACIÓN DE TOKEN =====
export const isTokenValid = (token) => {
  if (!token) {
    return false;
  }
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('❌ [isTokenValid] Error validating token:', error);
    return false;
  }
};

export const isTokenExpired = (token) => {
  return !isTokenValid(token);
};

// ===== FUNCIONES DE MANEJO DE USUARIO =====
export const getUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const getUserRole = () => {
  const user = getUser();
  if (user?.is_staff === true) return 'ADMIN';
  return user?.role || 'USER';
};

export const getUserState = () => {
  const user = getUser();
  // ✅ Soportar user_state y state
  const state = user?.user_state || user?.state;
  return state || 'PENDING';
};

export const isAdmin = () => {
  const user = getUser();
  return user?.is_staff === true || getUserRole() === 'ADMIN';
};

export const isUserActive = () => {
  const state = getUserState();
  const activeStates = ['ACTIVE', 'Activo', 'ACTIVATED', 'active'];
  return activeStates.includes(state);
};

export const canAccessAdminPanel = () => {
  const user = getUser();
  const adminCheck = isAdmin();
  const activeCheck = isUserActive();
  return adminCheck && activeCheck;
};

// ===== FUNCIONES DE AUTENTICACIÓN =====
export const isAuthenticated = () => {
  
  const token = localStorage.getItem('access_token');
  const user = getUser();
  
  
  if (!token || !user) {
    return false;
  }
  
  // Verificar que el token sea válido
  const tokenValid = isTokenValid(token);
  
  if (!tokenValid) {
    return false;
  }
  
  // Verificar que el usuario esté activo
  const userActive = isUserActive();
  
  return tokenValid && userActive;
};

export const hasValidSession = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  return accessToken && refreshToken;
};

// ===== FUNCIONES DE MANEJO DE DATOS DE AUTENTICACIÓN =====
export const setAuthData = (data) => {
  try {    
    if (data.access) {
      localStorage.setItem('access_token', data.access);
    }
    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  } catch (error) {
    console.error('❌ [setAuthData] Error saving auth data:', error);
  }
};

export const updateUserData = (userData) => {
  try {
    const currentUser = getUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  } catch (error) {
    console.error('Error updating user data:', error);
  }
};


export function clearAuthData() {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  } catch (e) {
    console.error('Error clearing auth data:', e);
  }
};

// ===== FUNCIONES DE REFRESH TOKEN =====
export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

export const isRefreshTokenValid = () => {
  const refreshToken = getRefreshToken();
  return refreshToken && isTokenValid(refreshToken);
};

// ===== FUNCIONES DE NAVEGACIÓN Y ESTADO =====
export const shouldRedirectToLogin = () => {
  return !isAuthenticated();
};

export const shouldRedirectToAdmin = () => {
  const user = getUser();
  return user?.is_staff === true && isUserActive();
};

export const getAuthRedirectPath = () => {
  if (shouldRedirectToAdmin()) {
    return '/admin/';
  }
  return '/dashboard/';
};

// ===== FUNCIONES DE PERMISOS =====
export const hasPermission = (permission) => {
  const user = getUser();
  
  if (!user) return false;
  
  // Permisos por rol
  const rolePermissions = {
    'ADMIN': ['all'], // Administradores tienen todos los permisos
    'USER': ['read', 'create'], // Usuarios regulares
  };
  
  const userRole = getUserRole();
  const userPermissions = rolePermissions[userRole] || [];
  
  return userPermissions.includes('all') || userPermissions.includes(permission);
};

export const canManageUsers = () => {
  return hasPermission('manage_users') || isAdmin();
};

export const canManageInvitations = () => {
  return hasPermission('manage_invitations') || isAdmin();
};

export const canViewStats = () => {
  return hasPermission('view_stats') || isAdmin();
};

// ===== FUNCIONES DE VALIDACIÓN DE ESTADOS =====
export const isUserStateValid = (requiredStates = ['ACTIVE', 'Activo']) => {
  const userState = getUserState();
  return requiredStates.includes(userState);
};

export const canPerformAction = (action) => {
  const user = getUser();
  
  if (!user) return false;
  
  // Verificar que el usuario esté activo
  if (!isUserActive()) return false;
  
  // Verificaciones específicas por acción
  const actionPermissions = {
    'create_invitation': ['ADMIN'],
    'manage_users': ['ADMIN'],
    'view_admin_panel': ['ADMIN'],
    'review_requests': ['ADMIN'],
  };
  
  const requiredRoles = actionPermissions[action];
  if (requiredRoles) {
    const userRole = getUserRole();
    return requiredRoles.includes(userRole);
  }
  
  return true;
};

// ===== FUNCIONES DE UTILIDAD =====
export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const formatUserDisplay = (user = getUser()) => {
  if (!user) return 'Usuario';
  
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  const email = user.email || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  if (email) {
    return email.split('@')[0]; // Solo la parte antes del @
  }
  
  return 'Usuario';
};

export const getUserInitials = (user = getUser()) => {
  if (!user) return 'U';
  
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  
  return 'U';
};