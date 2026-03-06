import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { Toaster } from '@/components/ui/toaster';
import LandPage from './Page.jsx';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TreePine, AlertCircle, ArrowLeft } from 'lucide-react';

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

import './index.css'

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
  const { isAuthenticated, initializing, isActive } = useAuth();
  
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

// ===== COMPONENTE PARA ACCESO DENEGADO =====
const AccessDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8"
      style={{
        backgroundColor: "#1a2e05",
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(25, 195, 230, 0.05) 0%, transparent 50%),
          linear-gradient(rgba(26, 46, 5, 0.95), rgba(26, 46, 5, 0.95))
        `,
        backgroundAttachment: "fixed"
      }}
    >
      {/* SVG Decorativo */}
      <div className="absolute right-0 top-20 opacity-10 hidden lg:block pointer-events-none">
        <svg height="400" viewBox="0 0 200 200" width="400" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 20 Q110 60 140 80 T180 140" fill="none" stroke="#19c3e6" strokeWidth="0.5" />
          <path d="M100 20 Q90 70 60 100 T20 160" fill="none" stroke="#19c3e6" strokeWidth="0.5" />
          <circle cx="100" cy="20" fill="#19c3e6" r="2" />
          <circle cx="140" cy="80" fill="#19c3e6" r="1.5" />
          <circle cx="180" cy="140" fill="#19c3e6" r="2" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header/Logo */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center items-center gap-3 mb-6"
          >
            <TreePine className="h-8 w-8 text-[#19c3e6]" strokeWidth={3} />
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[#f5f5f0]">
              Árbol de la Ciencia
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#19c3e6]/70 uppercase tracking-[0.3em] text-xs font-bold"
          >
            Universidad Nacional de Colombia
          </motion.p>
        </div>

        {/* Access Denied Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-xl overflow-hidden border border-rose-500/30"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.8)"
          }}
        >
          {/* Card Header */}
          <div className="p-8 md:p-10 border-b border-rose-500/20 bg-rose-500/5">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-rose-400" />
            </div>
            <h2 className="font-serif text-2xl mb-2 text-center text-[#f5f5f0]">Acceso Denegado</h2>
            <p className="text-center text-[#f5f5f0]/60 text-sm">
              No tienes permisos de administrador para acceder a esta sección
            </p>
          </div>

          {/* Card Content */}
          <div className="p-8 md:p-10 space-y-6">
            {/* Message */}
            <div className="p-4 rounded-lg bg-rose-500/20 border border-rose-500/30">
              <p className="text-sm text-rose-400 text-center">
                Solo los administradores pueden acceder a esta área del sistema. Si crees que esto es un error, contacta con soporte.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                className="w-full bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] uppercase tracking-widest text-sm"
                style={{
                  boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
                }}
              >
                Ir al Dashboard
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 border border-[#93bfc8]/30 hover:border-[#19c3e6] hover:bg-[#19c3e6]/5 text-[#f5f5f0] font-bold rounded-lg transition-all uppercase tracking-widest text-sm"
                style={{
                  background: "rgba(26, 46, 5, 0.6)"
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Inicio
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="fixed bottom-0 left-0 right-0 p-4 text-center space-y-4 pointer-events-none"
      >
        <p className="text-[9px] text-[#f5f5f0]/20 tracking-tighter">
          © {new Date().getFullYear()} Universidad Nacional de Colombia. Todos los derechos reservados.
        </p>
      </motion.footer>
    </div>
  );
};

// Componente para rutas protegidas de administrador
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, initializing, canAccessAdmin, isActive } = useAuth();
  
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
    return <AccessDeniedPage />;
  }
  
  return children;
};

// Componente para rutas públicas (solo accesibles si no está autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();
  
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

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