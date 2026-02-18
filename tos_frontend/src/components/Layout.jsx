import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  TreePine,
  Home,
  History,
  BookOpen,
  Plus,
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Generar Árbol', href: '/generate', icon: TreePine },
    { name: 'Historial', href: '/history', icon: History },
    { name: 'Bibliografía', href: '/bibliography', icon: BookOpen },
    
  ];

  // Detectar cambios de viewport
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar dropdown cuando cambiar de página
  useEffect(() => {
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const getUserInitials = (user) => {
    if (!user) return 'U';
    const firstInitial = user.first_name?.charAt(0) || '';
    const lastInitial = user.last_name?.charAt(0) || '';
    return (firstInitial + lastInitial) || user.email?.charAt(0) || 'U';
  };

  const isActive = (href) => location.pathname === href;

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex"
      style={{
        backgroundColor: "#0f1513",
      }}
    >
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`${
          isMobile ? 'fixed' : 'relative'
        } inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-[#19c3e6]/10`}
        style={{
          background: "rgba(15, 21, 19, 0.8)",
          backdropFilter: "blur(12px)",
        }}
        initial={false}
        animate={isMobile ? (sidebarOpen ? { x: 0 } : { x: -256 }) : { x: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#19c3e6]/10">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-[#19c3e6]/20 flex items-center justify-center border border-[#19c3e6]/30">
              <TreePine className="h-6 w-6 text-[#19c3e6]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#f5f5f0] tracking-tight">Árbol de la Ciencia</h1>
              <p className="text-[9px] text-[#19c3e6] uppercase tracking-widest font-semibold">v1.0</p>
            </div>
          </Link>
          {isMobile && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-[#19c3e6]/10 rounded-lg transition-colors text-[#f5f5f0]"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
          {navigation.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    active
                      ? 'bg-[#19c3e6]/15 border-r-3 border-[#19c3e6] text-[#19c3e6]'
                      : 'text-[#f5f5f0]/60 hover:text-[#f5f5f0] hover:bg-[#19c3e6]/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${active ? 'text-[#19c3e6]' : 'group-hover:text-[#19c3e6]'}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </motion.div>
            );
          })}

          {/* Item solo para administradores */}
          {user?.is_staff && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navigation.length * 0.05 }}
            >
              <Link
                to="/admin"
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive('/admin')
                    ? 'bg-[#19c3e6]/15 border-r-3 border-[#19c3e6] text-[#19c3e6]'
                    : 'text-[#f5f5f0]/60 hover:text-[#f5f5f0] hover:bg-[#19c3e6]/5'
                }`}
              >
                <span className="w-5 h-5 rounded bg-[#19c3e6]/20 border border-[#19c3e6]/40 flex items-center justify-center text-[10px] font-bold text-[#19c3e6]">
                  AD
                </span>
                <span className="text-sm font-medium">Panel de administración</span>
              </Link>
            </motion.div>
          )}
        </nav>

        {/* Footer - Create Button */}
        <div className="p-4 border-t border-[#19c3e6]/10">
          <Link 
            to="/generate" 
            onClick={handleNavClick}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold rounded-lg transition-all uppercase tracking-widest text-xs"
              style={{
                boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
              }}
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </motion.button>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-[#19c3e6]/10 relative z-20"
          style={{
            background: "rgba(15, 21, 19, 0.9)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Mobile Menu Button */}
          {isMobile && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#19c3e6]/10 rounded-lg transition-colors text-[#f5f5f0]"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          )}

          {/* Spacer for desktop */}
          {!isMobile && <div />}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#19c3e6]/10 rounded-lg transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-[#f5f5f0]">
                    {user?.first_name}
                  </p>
                  <p className="text-[9px] text-[#f5f5f0]/60">Investigador</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#19c3e6]/20 flex items-center justify-center border border-[#19c3e6]/30 text-[#19c3e6] font-bold text-xs">
                  {getUserInitials(user)}
                </div>
                <ChevronDown className={`w-4 h-4 text-[#f5f5f0]/60 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 rounded-lg border border-[#19c3e6]/10 overflow-hidden z-50"
                    style={{
                      background: "rgba(15, 21, 19, 0.95)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-[#19c3e6]/10">
                      <p className="text-sm font-bold text-[#f5f5f0]">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-[#f5f5f0]/60 truncate mt-1">
                        {user?.email}
                      </p>
                    </div>

                    {/* Logout */}
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 overflow-y-auto relative z-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;