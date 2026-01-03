import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminInvitations from './AdminInvitations';
import AdminRequests from './AdminRequests';
import AdminSettings from './AdminSettings';

const AdminRoutes = () => {
  console.log('🔍 [AdminRoutes] Renderizando rutas de administrador');
  
  return (
    <Routes>
      {/* Ruta principal del panel de admin */}
      <Route path="/" element={<AdminPanel />} />
      
      {/* Rutas específicas */}
      <Route path="/dashboard" element={<AdminPanel />} />
      <Route path="/users" element={<AdminPanel />} />
      <Route path="/invitations" element={<AdminPanel />} />
      <Route path="/requests" element={<AdminPanel />} />
      <Route path="/settings" element={<AdminPanel />} />
      
      {/* Ruta catch-all para admin - redirige al dashboard */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
