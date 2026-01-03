import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { TreePine, LayoutDashboard, Users, Mail, UserPlus, Settings, LogOut, Menu, X } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, current: location.pathname === '/admin' },
    { name: 'Usuarios', href: '/admin/users', icon: Users, current: location.pathname === '/admin/users' },
    { name: 'Invitaciones', href: '/admin/invitations', icon: Mail, current: location.pathname === '/admin/invitations' },
    { name: 'Solicitudes Admin', href: '/admin/requests', icon: UserPlus, current: location.pathname === '/admin/requests' },
    { name: 'Configuraciones', href: '/admin/settings', icon: Settings, current: location.pathname === '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar para móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-full max-w-xs bg-white h-full">
            <div className="absolute top-0 right-0 p-2">
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={navigation} currentPath={location.pathname} />
          </div>
        </div>
      )}

      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-gray-800 overflow-y-auto">
          <SidebarContent navigation={navigation} currentPath={location.pathname} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="flex items-center">
                  <h1 className="text-lg font-medium text-gray-900">
                    Panel de Administración
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <p className="text-gray-700 font-medium">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-gray-500">Administrador</p>
                </div>
                <div className="flex space-x-2">
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">
                      Ver Sitio
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, currentPath }) => {
  return (
    <div className="flex flex-col h-0 flex-1 overflow-y-auto bg-gray-800">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 py-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-600 rounded-lg">
            <TreePine className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-white text-sm font-medium">Árbol de la Ciencia</p>
            <p className="text-gray-400 text-xs">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                item.current
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
            >
              <Icon
                className={`${
                  item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                } mr-3 h-5 w-5 flex-shrink-0`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminLayout;