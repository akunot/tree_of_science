import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Componentes de páginas - Lazy Loading para mejor rendimiento
// Los componentes se cargan solo cuando se necesitan, no al inicio
const LandPage = lazy(() => import('@/pages/LandingPage'));
const Login = lazy(() => import('@/components/Login').then(module => ({ default: module.LoginForm || module.default })));
const Register = lazy(() => import('@/components/Register'));
const AdminRequest = lazy(() => import('@/components/AdminRequest'));
const ForgotPassword = lazy(() => import('@/components/ForgotPassword'));
const ResetPassword = lazy(() => import('@/components/ResetPassword'));
const VerifyEmail = lazy(() => import('@/components/VerifyEmail'));
const AccountSuspended = lazy(() => import('@/components/AccountSuspended'));
const AboutUsPage = lazy(() => import('@/components/AboutUs'));
const Dashboard = lazy(() => import('@/components/Dashboard'));
const TreeGenerator = lazy(() => import('@/components/TreeGenerator'));
const TreeHistory = lazy(() => import('@/components/TreeHistory'));
const TreeDetail = lazy(() => import('@/components/TreeDetail'));
const BibliographyManager = lazy(() => import('@/components/BibliographyManager'));

// Componentes base
import Layout from '@/components/Layout';
import AdminRoutes from '@/components/admin/AdminRoutes';

// Componentes de protección de rutas
import { ProtectedRoute, PublicRoute, AdminProtectedRoute } from './routeProtectors';

/**
 * Componente de carga para Suspense
 * Muestra un spinner mientras el componente se carga
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#0f1513]">
    <Loader2 className="animate-spin h-8 w-8 text-[#19c3e6]" />
  </div>
);

/**
 * Componente principal de rutas
 * Maneja todas las rutas de la aplicación con su protección correspondiente
 * Usa lazy loading para cargar componentes solo cuando se necesitan
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
      {/* ===== RUTAS PÚBLICAS ===== */}
      
      {/* Landing page */}
      <Route path="/" element={<LandPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      
      {/* Rutas de autenticación */}
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
      
      {/* Rutas especiales */}
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/account-suspended" element={<AccountSuspended />} />
      <Route path="/invitation/:token" element={<Register />} />
      
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
      
      {/* ===== RUTAS LEGACY (REDIRECTS) ===== */}
      <Route path="/user" element={<Navigate to="/dashboard" replace />} />
      <Route path="/users" element={<Navigate to="/admin/users" replace />} />
      <Route path="/invitations" element={<Navigate to="/admin/invitations" replace />} />
      
      {/* ===== RUTA POR DEFECTO ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

export default AppRoutes;
