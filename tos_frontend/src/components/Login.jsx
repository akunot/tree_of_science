import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../lib/api';
import { TreePine, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response) => {
      // Usar la función login del hook
      login(response.data);

      // Guardar preferencia "Recuérdame"
      if (formData.rememberMe) {
        localStorage.setItem("remember_email", formData.email);
      } else {
        localStorage.removeItem("remember_email");
      }

      // Redirigir según el rol
      const { user } = response.data;
      if (user.is_staff) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        '';

      // 1) Sistema en mantenimiento
      if (error.response?.status === 503) {
        setError(
          backendError ||
          'El sistema está en mantenimiento. Solo administradores pueden iniciar sesión.'
        );
        return;
      }

      // 2) Cuenta no activa (suspendida / pendiente) -> pantalla especial
      if (
        error.response?.status === 403 &&
        backendError === 'Cuenta no activa. Contacte al administrador.'
      ) {
        navigate('/account-suspended', { replace: true });
        return;
      }

      // 3) Otros casos (no verificada, invitación no aceptada, etc.) -> mostrar en el login
      setError(
        backendError ||
        'Error al iniciar sesión. Verifique sus credenciales.'
      );
    },
  });

  // Validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validaciones locales
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Por favor ingrese su correo electrónico';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor ingrese un correo válido';
    }

    if (!formData.password) {
      newErrors.password = 'Por favor ingrese su contraseña';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    // Enviar al backend
    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Limpiar errores cuando el usuario escribe
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
    if (error) setError('');
  };

  // Cargar email guardado si existe
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('remember_email');
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

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

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-xl overflow-hidden border border-[#19c3e6]/20"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.8)"
          }}
        >
          {/* Card Header */}
          <div className="p-8 md:p-10 border-b border-[#19c3e6]/20">
            <h2 className="font-serif text-2xl mb-2 text-center text-[#f5f5f0]">Acceso a la Plataforma</h2>
            <p className="text-center text-[#f5f5f0]/60 text-sm">
              Ingrese sus credenciales para acceder a la plataforma
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-[#19c3e6]/20"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-3"
            >
              <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Correo Institucional
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="investigador@unal.edu.co"
                className={`w-full px-4 py-3 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none ${
                  validationErrors.email
                    ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/20"
                    : "border-[#93bfc8]/30 focus:border-[#19c3e6] focus:ring-[#19c3e6]/20"
                }`}
                style={{
                  background: "rgba(26, 46, 5, 0.6)"
                }}
                required
              />
              {validationErrors.email && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.email}
                </p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Contraseña
                </label>
                <Link 
                  to="/forgot-password"
                  className="text-[10px] uppercase tracking-tighter text-[#f5f5f0]/40 hover:text-[#19c3e6] transition-colors"
                >
                  ¿Olvidó su clave?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-3 pr-12 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none ${
                    validationErrors.password
                      ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/20"
                      : "border-[#93bfc8]/30 focus:border-[#19c3e6] focus:ring-[#19c3e6]/20"
                  }`}
                  style={{
                    background: "rgba(26, 46, 5, 0.6)"
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5f5f0]/30 hover:text-[#19c3e6] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.password}
                </p>
              )}
            </motion.div>

            {/* Remember Me */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[#93bfc8]/30 text-[#19c3e6] cursor-pointer accent-[#19c3e6]"
              />
              <label htmlFor="rememberMe" className="text-xs text-[#f5f5f0]/60 cursor-pointer">
                Recuérdame en este dispositivo
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] uppercase tracking-widest text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
              }}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1a2e05] mr-2" />
                  Iniciando sesión...
                </div>
              ) : (
                "Iniciar sesión"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6 px-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#19c3e6]/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span 
                className="px-2 tracking-widest text-[#f5f5f0]/30"
                style={{
                  background: "rgba(26, 46, 5, 0.6)"
                }}
              >
                Protocolos de Seguridad
              </span>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="px-8 pb-8">
            <div className="p-4 rounded-lg border border-[#19c3e6]/20" style={{ background: "rgba(25, 195, 230, 0.05)" }}>
              <p className="text-[10px] text-[#f5f5f0]/60 mb-3 uppercase font-bold">Opciones de acceso adicionales</p>
              <div className="text-[10px] text-[#f5f5f0]/50 space-y-1">
                <p>✓ Autenticación JWT segura</p>
                <p>✓ Validación de cuenta activa</p>
                <p>✓ Soporte multirol (Admin/Usuario)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Register Link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-[#f5f5f0]/60"
        >
          ¿No tiene una cuenta?{" "}
          <Link 
            to="/register" 
            className="text-[#19c3e6] hover:text-[#19c3e6]/80 font-medium transition-colors"
          >
            Regístrese aquí
          </Link>
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

export default Login;