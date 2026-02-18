import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { authAPI } from '../lib/api';
import { 
  TreePine, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle, 
  AlertCircle,
  Shield,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Estado principal
  const [currentStep, setCurrentStep] = useState('verify'); // 'verify' o 'register'
  const [formData, setFormData] = useState({
    invitation_token: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  
  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [invitationData, setInvitationData] = useState(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  // Verificar si hay token en URL al cargar
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setFormData(prev => ({ ...prev, invitation_token: tokenFromUrl }));
      // Auto-verificar si hay token en URL
      setTimeout(() => {
        handleVerifyTokenWithValue(tokenFromUrl);
      }, 500);
    }
  }, [searchParams]);

  // Mutación para verificar token de invitación
  const verifyTokenMutation = useMutation({
    mutationFn: (token) => authAPI.verifyInvitation(token),
    onSuccess: (response) => {
      const data = response.data || response;
      setInvitationData(data);
      setFormData(prev => ({ 
        ...prev, 
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || ''
      }));
      setCurrentStep('register');
      setErrors({});
    },
    onError: (error) => {
      console.error('Error verificando token:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          error.message ||
                          'Token inválido o expirado';
      setErrors({ invitation_token: [errorMessage] });
    },
  });

  // Mutación para el registro con invitación
  const registerMutation = useMutation({
    mutationFn: authAPI.registerWithInvitation,
    onSuccess: (response) => {
      login(response.data);
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Error en registro:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Error al completar registro. Intente nuevamente.' });
      }
    },
  });

  const handleVerifyTokenWithValue = (tokenValue) => {
    setErrors({});
    if (!tokenValue) {
      setErrors({ invitation_token: ['Por favor ingrese el token de invitación'] });
      return;
    }
    verifyTokenMutation.mutate(tokenValue);
  };

  const handleVerifyToken = (e) => {
    e.preventDefault();
    handleVerifyTokenWithValue(formData.invitation_token);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrors({});
    
    // Validaciones
    if (!formData.first_name.trim()) {
      setErrors(prev => ({ ...prev, first_name: ['El nombre es requerido'] }));
      return;
    }
    
    if (!formData.last_name.trim()) {
      setErrors(prev => ({ ...prev, last_name: ['El apellido es requerido'] }));
      return;
    }
    
    if (formData.password.length < 8) {
      setErrors(prev => ({ ...prev, password: ['La contraseña debe tener al menos 8 caracteres'] }));
      return;
    }
    
    if (formData.password !== formData.password_confirm) {
      setErrors(prev => ({ ...prev, password_confirm: ['Las contraseñas no coinciden'] }));
      return;
    }
    
    registerMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const handleBackToToken = () => {
    setCurrentStep('verify');
    setInvitationData(null);
    setFormData(prev => ({ 
      ...prev, 
      email: '', 
      first_name: '', 
      last_name: '', 
      password: '', 
      password_confirm: '' 
    }));
    setErrors({});
  };

  const copyTokenToClipboard = () => {
    if (formData.invitation_token) {
      navigator.clipboard.writeText(formData.invitation_token);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

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
      <div className="absolute left-0 bottom-0 opacity-10 hidden lg:block pointer-events-none w-1/3">
        <svg height="400" viewBox="0 0 200 200" width="400" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 20 Q110 60 140 80 T180 140" fill="none" stroke="#19c3e6" strokeWidth="0.5" />
          <path d="M100 20 Q90 70 60 100 T20 160" fill="none" stroke="#19c3e6" strokeWidth="0.5" />
          <circle cx="100" cy="20" fill="#19c3e6" r="2" />
          <circle cx="60" cy="100" fill="#19c3e6" r="1.5" />
          <circle cx="20" cy="160" fill="#19c3e6" r="2" />
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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-1"
          >
            <p className="text-[#19c3e6]/70 uppercase tracking-[0.3em] text-xs font-bold">
              Universidad Nacional de Colombia
            </p>
            <p className="text-[#f5f5f0]/50 text-xs tracking-wide">
              Portal de Investigación Colaborativa
            </p>
          </motion.div>
        </div>

        {/* Step Indicator */}
        {currentStep === 'register' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-center space-x-4 text-sm text-[#f5f5f0]/60"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-[#19c3e6] text-[#1a2e05] flex items-center justify-center text-xs font-bold">✓</div>
              <span className="text-xs">Token verificado</span>
            </div>
            <ArrowRight className="w-4 h-4" />
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-[#19c3e6]/50 text-[#f5f5f0] flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-xs">Completar registro</span>
            </div>
          </motion.div>
        )}

        {/* Register Card */}
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
          <div 
            className="p-8 md:p-10 border-b border-[#19c3e6]/20"
            style={{
              background: "rgba(25, 195, 230, 0.05)"
            }}
          >
            <h2 className="font-serif text-2xl text-[#f5f5f0] text-center mb-2">
              {currentStep === 'verify' ? 'Verificar Invitación' : 'Completar Registro'}
            </h2>
            <p className="text-center text-[#f5f5f0]/60 text-sm">
              {currentStep === 'verify' 
                ? 'Ingrese su token de invitación para continuar'
                : 'Complete su información personal para crear su cuenta'
              }
            </p>
          </div>

          {currentStep === 'verify' ? (
            // Paso 1: Verificar token de invitación
            <form onSubmit={handleVerifyToken}>
              <div className="p-8 md:p-10 space-y-6">
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-[#19c3e6]/20"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{errors.general}</p>
                  </motion.div>
                )}

                {/* Token Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="space-y-3"
                >
                  <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Token de Invitación
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="invitation_token"
                      value={formData.invitation_token}
                      onChange={handleChange}
                      placeholder="ej: aae98f25-4830-48f4-acd9-8149d05c3390"
                      className={`w-full px-4 py-3 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none font-mono pr-12 ${
                        errors.invitation_token 
                          ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/20" 
                          : "border-[#93bfc8]/30 focus:border-[#19c3e6] focus:ring-[#19c3e6]/20"
                      }`}
                      style={{
                        background: "rgba(26, 46, 5, 0.6)"
                      }}
                      required
                    />
                    {formData.invitation_token && (
                      <button
                        type="button"
                        onClick={copyTokenToClipboard}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5f5f0]/30 hover:text-[#19c3e6] transition-colors"
                        title="Copiar token"
                      >
                        {tokenCopied ? (
                          <Check className="w-4 h-4 text-[#19c3e6]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {errors.invitation_token && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.invitation_token[0]}
                    </div>
                  )}
                  <p className="text-xs text-[#f5f5f0]/50">
                    Ingrese el token que recibió en su correo electrónico
                  </p>
                </motion.div>

                {/* Security Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-lg border border-[#19c3e6]/30"
                  style={{
                    background: "rgba(25, 195, 230, 0.05)"
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-[#19c3e6] mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-[#19c3e6] mb-1">Registro Seguro por Invitación</p>
                      <p className="text-[#f5f5f0]/60 text-xs leading-relaxed">
                        Este sistema requiere una invitación válida de un administrador para garantizar la calidad y seguridad de la plataforma. Si no ha recibido una invitación, contacte a su administrador.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Features List */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="space-y-2 p-4 rounded-lg"
                  style={{
                    background: "rgba(26, 46, 5, 0.4)"
                  }}
                >
                  {[
                    "Acceso a herramientas de análisis colaborativo",
                    "Gestión de proyectos de investigación",
                    "Bibliografía compartida y recursos"
                  ].map((text) => (
                    <div key={text} className="flex items-start gap-2 text-xs text-[#f5f5f0]/60">
                      <Check className="h-4 w-4 text-[#19c3e6] mt-0.5 flex-shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  type="submit"
                  disabled={verifyTokenMutation.isPending}
                  className="w-full bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
                  }}
                >
                  {verifyTokenMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1a2e05] mr-2" />
                      Verificando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Verificar Invitación</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </motion.button>
              </div>
            </form>
          ) : (
            // Paso 2: Completar información personal
            <form onSubmit={handleRegister}>
              <div className="p-8 md:p-10 space-y-6">
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-[#19c3e6]/20"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{errors.general}</p>
                  </motion.div>
                )}

                {/* Verification Success */}
                {invitationData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border border-[#19c3e6]/30"
                    style={{
                      background: "rgba(25, 195, 230, 0.05)"
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-[#19c3e6] mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-[#19c3e6] mb-1">Invitación verificada ✓</p>
                        <p className="text-[#f5f5f0]/60 text-xs">Email: <strong>{invitationData.email}</strong></p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Name Fields */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {[
                    { id: "first_name", label: "Nombre", placeholder: "Juan" },
                    { id: "last_name", label: "Apellido", placeholder: "Pérez" }
                  ].map((field) => (
                    <div key={field.id} className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {field.label}
                      </label>
                      <input
                          type="text"
                          name={field.id}
                          value={formData[field.id] || ""}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          className={`w-full px-4 py-3 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none ${
                            errors[field.id]
                              ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/20"
                              : "border-[#93bfc8]/30 focus:border-[#19c3e6] focus:ring-[#19c3e6]/20"
                          }`}
                          style={{
                            background: "rgba(26, 46, 5, 0.6)"
                          }}
                          required
                        />
                      {errors[field.id] && (
                        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          {errors[field.id][0]}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>

                {/* Email Field (Disabled) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 rounded-lg text-sm text-[#f5f5f0]/40 border border-[#93bfc8]/20 cursor-not-allowed opacity-50"
                    style={{
                      background: "rgba(26, 46, 5, 0.3)"
                    }}
                  />
                  <p className="text-xs text-[#f5f5f0]/50">
                    Email predefinido desde la invitación (no editable)
                  </p>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="space-y-3"
                >
                  <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      className={`w-full px-4 py-3 pr-12 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none ${
                        errors.password
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
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.password[0]}
                    </div>
                  )}
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleChange}
                      placeholder="Repita la contraseña"
                      className={`w-full px-4 py-3 pr-12 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none ${
                        errors.password_confirm
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
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5f5f0]/30 hover:text-[#19c3e6] transition-colors"
                    >
                      {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password_confirm && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.password_confirm[0]}
                    </div>
                  )}
                  {errors.non_field_errors && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.non_field_errors[0]}
                    </div>
                  )}
                </motion.div>

                {/* Password Requirements */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="p-4 rounded-lg border border-[#19c3e6]/20"
                  style={{
                    background: "rgba(25, 195, 230, 0.05)"
                  }}
                >
                  <p className="text-xs font-bold text-[#19c3e6] mb-2 uppercase">Requisitos de contraseña:</p>
                  <div className="space-y-1 text-xs">
                    <div className={formData.password.length >= 8 ? "text-[#19c3e6]" : "text-[#f5f5f0]/40"}>
                      ✓ Mínimo 8 caracteres
                    </div>
                    <div className={formData.password === formData.password_confirm && formData.password ? "text-[#19c3e6]" : "text-[#f5f5f0]/40"}>
                      ✓ Contraseñas coinciden
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
                  }}
                >
                  {registerMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1a2e05] mr-2" />
                      Completando registro...
                    </div>
                  ) : (
                    "Completar Registro"
                  )}
                </motion.button>

                {/* Back Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  type="button"
                  onClick={handleBackToToken}
                  className="w-full border border-[#19c3e6]/20 hover:bg-[#19c3e6]/5 text-[#f5f5f0] font-bold py-3 rounded-lg transition-all uppercase tracking-widest text-sm"
                >
                  Usar otro token
                </motion.button>
              </div>

              {/* Login Link */}
              <div className="px-8 pb-8 border-t border-[#19c3e6]/10 pt-6 text-center text-sm text-[#f5f5f0]/60">
                ¿Ya tiene una cuenta?{" "}
                <Link 
                  to="/login" 
                  className="text-[#19c3e6] hover:text-[#19c3e6]/80 font-medium transition-colors"
                >
                  Inicie sesión aquí
                </Link>
              </div>
            </form>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center text-xs text-[#f5f5f0]/40"
        >
           © {new Date().getFullYear()} Universidad Nacional de Colombia. Todos los derechos reservados.
          <p className="mt-1">Plataforma de investigación colaborativa</p>
        </motion.div>
      </motion.div>

      {/* Footer Links */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-0 left-0 right-0 p-4 text-center space-y-4 pointer-events-none"
      >
      </motion.footer>
    </div>
  );
};

export default Register;