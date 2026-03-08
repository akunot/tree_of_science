import { Routes, Route, Navigate } from 'react-router-dom';

// Componentes de páginas
import LandPage from '@/pages/LandingPage';
import { LoginForm as Login } from '@/features/auth/components';
import { RegisterForm as Register } from '@/features/auth/components';
import { AdminRequest } from '@/features/auth/components';
import { ForgotPassword } from '@/features/auth/components';
import { ResetPassword } from '@/features/auth/components';
import VerifyEmail from '@/components/VerifyEmail';
import AccountSuspended from '@/components/AccountSuspended';
import AboutUsPage from '@/components/AboutUs';
import { Dashboard } from '@/features/trees/components';
import { TreeGenerator } from '@/features/trees/components';
import { TreeHistory } from '@/features/trees/components';
import { TreeDetail } from '@/features/trees/components';
import { BibliographyManager } from '@/features/bibliography/components';
import Layout from '@/components/Layout';
import AdminRoutes from '@/components/admin/AdminRoutes';

// Componentes de protección de rutas
import { ProtectedRoute, PublicRoute, AdminProtectedRoute } from './routeProtectors';

/**
 * Componente principal de rutas
 * Maneja todas las rutas de la aplicación con su protección correspondiente
 */
export function AppRoutes() {
  return (
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
  );
}

export default AppRoutes;
