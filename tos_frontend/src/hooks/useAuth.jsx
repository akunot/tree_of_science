import { useState, useEffect, createContext, useContext } from 'react';
import { 
  isAuthenticated, 
  getUser, 
  setAuthData, 
  clearAuthData,
  isAdmin,
  isUserActive,
  canPerformAction,
  hasPermission,
  getUserRole,
  getUserState,
  hasValidSession,
  shouldRedirectToLogin,
  shouldRedirectToAdmin,
  canAccessAdminPanel
} from '../lib/auth';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Cargar datos de localStorage (solo `user`, tokens están en cookies HttpOnly)
        if (isAuthenticated()) {
          setUser(getUser());
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('❌ [AUTH] Error en inicialización:', err);
        setUser(null);
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ LOGIN: ahora solo guardamos `user`; los tokens van en cookies HttpOnly
  const login = (authData) => {
    try {
      setLoading(true);
      setError(null);

      const { user } = authData || {};

      // Guardar en localStorage (solo user)
      setAuthData({ user });

      // Actualizar estado
      setUser(user);

      return { success: true, user };
    } catch (err) {
      const errorMessage = err?.message || 'Error guardando datos de autenticación';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      try {
        await authAPI.logout();
      } catch (logoutError) {
        console.warn('Server logout failed, clearing local data anyway');
      }
      
      clearAuthData();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  const refreshUserData = async () => {
    try {
      if (!user) return;
      
      const response = await authAPI.getCurrentUser();
      if (response.data) {
        setUser(response.data);
        return response.data;
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
      throw err;
    }
  };

  // Funciones de verificación mejoradas
  const checkPermission = (permission) => {
    return hasPermission(permission);
  };

  const checkAction = (action) => {
    return canPerformAction(action);
  };

  const isUserSuspended = () => {
    const state = getUserState();
    return state === 'SUSPENDED' || state === 'Suspendido';
  };

  const isUserPending = () => {
    const state = getUserState();
    return state === 'PENDING' || state === 'Pendiente';
  };

  // Valor del contexto completo
  const value = {
    // Estado del usuario
    user,
    loading,
    initializing,
    error,
    
    // Funciones de autenticación
    login,
    logout,
    updateUser,
    refreshUserData,
    
    isAuthenticated: !!user,
    isAdmin: isAdmin(),
    canAccessAdmin: canAccessAdminPanel(),
    isActive: isUserActive(), 
    isPending: isUserPending(),
    isSuspended: isUserSuspended(),
    
    // Verificaciones de permisos
    hasPermission: checkPermission,
    canPerformAction: checkAction,
    canManageUsers: isAdmin(),
    canManageInvitations: isAdmin(),
    canViewStats: isAdmin(),
    
    // Información del usuario
    userRole: getUserRole(),
    userState: getUserState(),
    userFullName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    userEmail: user?.email || '',
    
    // Utilidades
    clearError: () => setError(null),
    hasValidSession: hasValidSession(),
    shouldRedirectToLogin: shouldRedirectToLogin(),
    shouldRedirectToAdmin: shouldRedirectToAdmin(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook adicional para verificaciones específicas
export const useRequireAuth = () => {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.initializing && !auth.isAuthenticated) {
      const currentPath = window.location.pathname;
      console.warn(`Access denied to ${currentPath}. User not authenticated.`);
    }
  }, [auth.isAuthenticated, auth.initializing]);
  
  return auth;
};

export const useRequireAdmin = () => {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.initializing && (!auth.isAuthenticated || !auth.canAccessAdmin)) {
      const currentPath = window.location.pathname;
      console.warn(`Admin access denied to ${currentPath}. Admin privileges required.`);
    }
  }, [auth.isAuthenticated, auth.canAccessAdmin, auth.initializing]);
  
  return auth;
};

// Hook para verificar permisos específicos
export const usePermission = (permission) => {
  const auth = useAuth();
  return auth.hasPermission(permission);
};

// Hook para verificar acciones específicas
export const useAction = (action) => {
  const auth = useAuth();
  return auth.canPerformAction(action);
};