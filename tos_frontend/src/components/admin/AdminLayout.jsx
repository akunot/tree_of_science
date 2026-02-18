import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import {
  TreePine,
  LayoutDashboard,
  Users,
  Mail,
  UserPlus,
  Settings,
  LogOut,
  Search,
  Download,
  ChevronRight,
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, current: location.pathname === '/admin' },
    { name: 'Usuarios', href: '/admin/users', icon: Users, current: location.pathname === '/admin/users' },
    { name: 'Invitaciones', href: '/admin/invitations', icon: Mail, current: location.pathname === '/admin/invitations'},
    { name: 'Solicitudes Admin', href: '/admin/requests', icon: UserPlus, current: location.pathname === '/admin/requests' },
    { name: 'Configuración', href: '/admin/settings', icon: Settings, current: location.pathname === '/admin/settings' },
  ];

  const pageTitles = {
    '/admin': 'Dashboard',
    '/admin/users': 'Usuarios',
    '/admin/invitations': 'Invitaciones',
    '/admin/requests': 'Solicitudes Admin',
    '/admin/settings': 'Configuración',
  };

  const currentPageTitle = pageTitles[location.pathname] || 'Panel';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{
        backgroundColor: "#0f1513",
      }}
    >
      {/* Sidebar - Persistente */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-72 flex flex-col border-r border-[#19c3e6]/10 flex-shrink-0 h-full"
        style={{
          background: "rgba(16, 46, 26, 0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 flex items-center gap-3"
        >
          <Link to="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1">
            <div className="w-10 h-10 rounded-lg bg-[#19c3e6] flex items-center justify-center text-[#102e1a] shadow-lg shadow-[#19c3e6]/20 flex-shrink-0">
              <TreePine className="h-6 w-6 fill-current" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold leading-none tracking-tight text-sm">Árbol de la Ciencia</h1>
              <span className="text-[#19c3e6]/70 text-[10px] font-medium uppercase tracking-widest">Lab Admin</span>
            </div>
          </Link>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-[#19c3e6]/50 text-[10px] uppercase tracking-widest font-bold px-3 mb-4">
            Gestión Principal
          </div>

          {navigation.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                    item.current
                      ? 'bg-[#19c3e6] text-[#102e1a] font-semibold shadow-lg shadow-[#19c3e6]/20'
                      : 'text-[#f5f5f0]/70 hover:text-[#f5f5f0] hover:bg-[#19c3e6]/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${item.current ? 'text-[#102e1a]' : 'group-hover:text-[#19c3e6]'}`} />
                  <span className="text-sm flex-1">{item.name}</span>
                  {item.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex-shrink-0"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 border-t border-[#19c3e6]/10 bg-black/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#19c3e6]/20 border border-[#19c3e6]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user?.first_name ? (
                <span className="text-xs font-bold text-[#19c3e6] uppercase">
                  {user.first_name.charAt(0)}{user.last_name?.charAt(0) || 'A'}
                </span>
              ) : (
                <Users className="h-4 w-4 text-[#19c3e6]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#f5f5f0] text-xs font-bold truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-[#19c3e6]/60 text-[10px] truncate">Administrador</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-1.5 hover:bg-[#19c3e6]/10 rounded-lg text-[#19c3e6] transition-colors flex-shrink-0"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="h-20 flex-shrink-0 border-b border-[#19c3e6]/10 z-10 px-8 flex items-center justify-between"
          style={{
            background: "rgba(15, 21, 19, 0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Left: Title & Breadcrumb */}
          <div className="flex items-center gap-6 flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-black text-[#f5f5f0] tracking-tight">
                {currentPageTitle}
              </h2>
            </motion.div>

            <div className="h-6 w-px bg-[#19c3e6]/20"></div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-xs font-medium text-[#f5f5f0]/60 uppercase tracking-widest"
            >
              <Link to="/admin" className="hover:text-[#19c3e6] transition-colors">
                Admin
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#19c3e6]">
                {currentPageTitle}
              </span>
            </motion.div>
          </div>

          {/* Right: Search & Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >

            {/* Botón para volver al Dashboard principal */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-black uppercase tracking-widest text-xs transition-all"
              style={{
                boxShadow: '0 0 20px rgba(25, 195, 230, 0.3)',
              }}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Ir al Dashboard</span>
            </motion.button>
          </motion.div>
        </motion.header>

        {/* Content Area */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex-1 overflow-y-auto relative"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#19c3e6]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>

          <div className="p-8 max-w-7xl mx-auto relative z-10">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;