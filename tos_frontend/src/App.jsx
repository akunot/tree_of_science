import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { Toaster } from '@/components/ui/toaster';
import LandPage from './Page.jsx';
import React, { useState, useEffect } from 'react';

// Componentes de páginas existentes
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import TreeGenerator from './components/TreeGenerator';
import TreeHistory from './components/TreeHistory';
import TreeDetail from './components/TreeDetail';
import BibliographyManager from './components/BibliographyManager';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Layout from './components/Layout';
import VerifyEmail from './components/VerifyEmail.jsx';
import AccountSuspended from './components/AccountSuspended.jsx';

// ===== NUEVOS COMPONENTES DEL SISTEMA DE ADMINISTRADOR =====

// Componentes de autenticación mejorados
import AdminRequest from './components/AdminRequest';

// Rutas de administrador
import AdminRoutes from './components/admin/AdminRoutes';

import './App.css';

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ===== COMPONENTES DE PROTECCIÓN DE RUTAS MEJORADOS =====

// Componente para rutas protegidas básicas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initializing, isActive } = useAuth(); // ✅ Usar initializing
  
  // ✅ Solo mostrar loading durante la inicialización
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar si el usuario está activo
  if (!isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Cuenta Suspendida</h2>
          <p className="text-gray-600 mb-4">
            Tu cuenta está suspendida o pendiente de activación. Contacta al administrador.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }
  
  return children;
};

// Componente para rutas protegidas de administrador
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, initializing, isAdmin, canAccessAdmin, isActive, user } = useAuth();
  // ✅ Solo mostrar loading durante la inicialización
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Cuenta Suspendida</h2>
          <p className="text-gray-600 mb-4">
            Tu cuenta está suspendida. Contacta al administrador.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }
  
  if (!canAccessAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos de administrador para acceder a esta sección.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Debug: isAdmin={String(isAdmin)}, canAccessAdmin={String(canAccessAdmin)}, is_admin={String(user?.is_admin)}
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return children;
};

// Componente para rutas públicas (solo accesibles si no está autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth(); // ✅ Usar initializing
  
  // ✅ Solo mostrar loading durante la inicialización
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;};

// Componente para manejo de errores
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error) => {
      console.error('Error caught by boundary:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error de Aplicación</h2>
          <p className="text-gray-600 mb-4">
            Ha ocurrido un error inesperado. Recarga la página para continuar.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recargar Página
          </button>
        </div>
      </div>
    );
  }
  
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
              <Routes>
                {/* ===== RUTAS PÚBLICAS ===== */}
                <Route path="/" element={<LandPage />} />
                
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />
                
                <Route path="/admin-request" element={
                  <PublicRoute>
                    <AdminRequest />
                  </PublicRoute>
                } />
                
                <Route path="/forgot-password" element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                } />
                
                <Route path="/reset-password" element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                } />

                <Route path="/verify-email" element={<VerifyEmail />} />

                <Route path="/account-suspended" element={<AccountSuspended />} />
                
                {/* ===== RUTAS PROTEGIDAS PARA USUARIOS REGULARES ===== */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/generate" element={
                  <ProtectedRoute>
                    <Layout>
                      <TreeGenerator />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/history" element={
                  <ProtectedRoute>
                    <Layout>
                      <TreeHistory />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/tree/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <TreeDetail />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/bibliography" element={
                  <ProtectedRoute>
                    <Layout>
                      <BibliographyManager />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* ===== RUTAS DE ADMINISTRADOR ===== */}
                <Route path="/admin/*" element={
                  <AdminProtectedRoute>
                    <AdminRoutes />
                  </AdminProtectedRoute>
                } />
                
                {/* ===== RUTAS DE INVITACIÓN (ACCESIBLES CON TOKEN) ===== */}
                <Route path="/invitation/:token" element={
                  <Register />
                } />
                
                {/* ===== RUTAS LEGACY (REDIRECTS) ===== */}
                <Route path="/user" element={<Navigate to="/dashboard" replace />} />
                <Route path="/users" element={<Navigate to="/admin/users" replace />} />
                <Route path="/invitations" element={<Navigate to="/admin/invitations" replace />} />
                
                {/* ===== RUTA POR DEFECTO ===== */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              
              {/* Toast notifications */}
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;