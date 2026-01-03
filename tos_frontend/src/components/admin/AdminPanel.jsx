import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminInvitations from './AdminInvitations';
import AdminRequests from './AdminRequests';
import AdminSettings from './AdminSettings';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // Determinar qué componente mostrar basado en la ruta
  const renderAdminComponent = () => {
    const path = location.pathname;
    
    if (path.includes('/admin/users')) {
      return <AdminUsers />;
    }
    if (path.includes('/admin/invitations')) {
      return <AdminInvitations />;
    }
    if (path.includes('/admin/requests')) {
      return <AdminRequests />;
    }
    if (path.includes('/admin/settings')) {
      return <AdminSettings />;
    }
    
    return <AdminDashboard />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderAdminComponent()}
    </div>
  );
};

export default AdminPanel;