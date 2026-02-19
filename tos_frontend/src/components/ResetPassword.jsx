import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { authAPI } from '../lib/api';
import { TreePine, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const userId = searchParams.get('user_id');

  useEffect(() => {
    if (!token || !userId) {
      setError('Enlace de recuperación inválido o expirado.');
    }
  }, [token, userId]);

  const resetPasswordMutation = useMutation({
    mutationFn: authAPI.resetPassword || (async (data) => data),
    onSuccess: () => {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    },
    onError: (error) => {
      setError(
        error.response?.data?.error ||
          error.response?.data?.new_password?.[0] ||
          error.response?.data?.detail ||
          'Error al restablecer la contraseña. Intente nuevamente.'
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    const newErrors = {};

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Las contraseñas no coinciden';
    }

    if (formData.new_password.length < 8) {
      newErrors.new_password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    resetPasswordMutation.mutate({
      token,
      user_id: userId,
      new_password: formData.new_password,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
    if (error) setError('');
  };

  // Success State
  if (success) {
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

          {/* Success Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-xl overflow-hidden border border-emerald-500/30"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.8)"
            }}
          >
            {/* Card Header */}
            <div className="p-8 md:p-10 border-b border-emerald-500/20 bg-emerald-500/5">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-emerald-400" />
              </div>
              <h2 className="font-serif text-2xl mb-2 text-center text-[#f5f5f0]">Acceso Restaurado</h2>
              <p className="text-center text-[#f5f5f0]/60 text-sm">
                Contraseña actualizada exitosamente. Ahora puede acceder a su archivo de investigación con total seguridad.
              </p>
            </div>

            {/* Form Content */}
            <div className="p-8 md:p-10 space-y-6">
              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="w-full bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] uppercase tracking-widest text-sm"
                style={{
                  boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
                }}
              >
                Ir al Panel de Investigación
              </motion.button>

              <p className="text-xs text-[#f5f5f0]/40 text-center">
                Será redirigido automáticamente en unos segundos...
              </p>
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
  }

  // Invalid Link State
  if (!token || !userId) {
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

          {/* Invalid Link Card */}
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
              <h2 className="font-serif text-2xl mb-2 text-center text-[#f5f5f0]">Enlace Inválido</h2>
              <p className="text-center text-[#f5f5f0]/60 text-sm">
                El enlace de recuperación es inválido o ha expirado
              </p>
            </div>

            {/* Buttons */}
            <div className="p-8 md:p-10 space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] uppercase tracking-widest text-sm"
                style={{
                  boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
                }}
              >
                Solicitar Nuevo Enlace
              </motion.button>

              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 px-4 py-4 border border-[#93bfc8]/30 hover:border-[#19c3e6] hover:bg-[#19c3e6]/5 text-[#f5f5f0] font-bold rounded-lg transition-all uppercase tracking-widest text-sm"
                style={{
                  background: "rgba(26, 46, 5, 0.6)"
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Inicio de Sesión
              </Link>
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
  }

  // Main Form
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
            <h2 className="font-serif text-2xl mb-2 text-center text-[#f5f5f0]">Restablecer Contraseña</h2>
            <p className="text-center text-[#f5f5f0]/60 text-sm">
              Ingrese su nueva contraseña para asegurar su cuenta
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

            {/* New Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-3"
            >
              <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-3 pr-12 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none ${
                    validationErrors.new_password
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
              {validationErrors.new_password && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.new_password}
                </p>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-3 pr-12 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none ${
                    validationErrors.confirm_password
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5f5f0]/30 hover:text-[#19c3e6] transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {validationErrors.confirm_password && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.confirm_password}
                </p>
              )}

              {/* Match Indicator */}
              {formData.confirm_password && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-[10px] font-bold flex items-center gap-1 ${
                    formData.new_password === formData.confirm_password
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {formData.new_password === formData.confirm_password ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Las contraseñas coinciden
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      Las contraseñas no coinciden
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] uppercase tracking-widest text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
              }}
            >
              {resetPasswordMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1a2e05] mr-2" />
                  Actualizando...
                </div>
              ) : (
                "Actualizar Credenciales"
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
                Recuperación Segura
              </span>
            </div>
          </div>

          {/* Footer Link */}
          <div className="px-8 pb-8">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-sm text-[#f5f5f0]/60 hover:text-[#19c3e6] transition-colors font-medium w-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Inicio de Sesión
            </Link>
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

export default ResetPassword;