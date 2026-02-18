import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminAPI } from '../lib/api';
import { TreePine, Mail, User, Building, FileText, Send, CheckCircle, AlertCircle, Lock, FileCheck } from 'lucide-react';

const AdminRequest = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    affiliation: '',
    justification: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [justLength, setJustLength] = useState(0);

  const navigate = useNavigate();

  // VALIDACIÓN COMPLETA DEL FORMULARIO
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.first_name.trim()) {
      newErrors.first_name = ['El nombre es obligatorio'];
    }

    // Validar apellido
    if (!formData.last_name.trim()) {
      newErrors.last_name = ['El apellido es obligatorio'];
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = ['El correo electrónico es obligatorio'];
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = ['Ingrese un correo electrónico válido'];
    }

    // Validar teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = ['El teléfono es obligatorio'];
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = ['Ingrese un teléfono válido (mínimo 10 dígitos)'];
    }

    // Validar afiliación
    if (!formData.affiliation.trim()) {
      newErrors.affiliation = ['La afiliación institucional es obligatoria'];
    }

    // Validar justificación
    if (!formData.justification.trim()) {
      newErrors.justification = ['La justificación es obligatoria'];
    } else if (formData.justification.trim().length < 50) {
      newErrors.justification = ['La justificación debe tener al menos 50 caracteres'];
    } else if (formData.justification.length > 500) {
      newErrors.justification = ['La justificación no puede exceder 500 caracteres'];
    }

    return newErrors;
  };

  // Mutación para enviar solicitud
  const requestMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const response = await adminAPI.submitRequest(data);
        console.log('✅ Respuesta exitosa:', response);
        return response;
      } catch (error) {
        console.error('❌ Error en la solicitud:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log('✅ Solicitud enviada exitosamente');
      setShowSuccess(true);
      setErrors({});
    },
    onError: (error) => {
      console.error('❌ Error en mutación:', error);

      // Manejo de diferentes tipos de errores
      if (error.response?.data) {
        setErrors(error.response.data);
      } else if (error.response?.status === 401) {
        setErrors({ general: 'No autorizado. Por favor inicie sesión.' });
      } else if (error.response?.status === 400) {
        setErrors({ general: 'Error en los datos enviados. Verifique el formulario.' });
      } else if (error.response?.status === 500) {
        setErrors({ general: 'Error del servidor. Intente más tarde.' });
      } else if (error.message === 'Network Error') {
        setErrors({ general: 'Error de conexión. Verifique su conexión a internet.' });
      } else {
        setErrors({ 
          general: error.response?.data?.detail || 'Error al enviar la solicitud. Intente nuevamente.' 
        });
      }
    },
  });

  // Redirigir después de éxito
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // EJECUTAR VALIDACIÓN COMPLETA
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      console.log('❌ Errores de validación:', validationErrors);
      setErrors(validationErrors);
      return;
    }

    // Si valida, enviar datos
    console.log('✅ Formulario válido, enviando:', formData);
    setErrors({}); // Limpiar errores previos
    requestMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Actualizar contador de justificación
    if (name === 'justification') {
      setJustLength(value.length);
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // PANTALLA DE ÉXITO
  if (showSuccess) {
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md z-10"
        >
          <div 
            className="rounded-2xl p-8 sm:p-12 flex flex-col items-center text-center border border-[#19c3e6]/20"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.8)"
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="bg-[#19c3e6]/20 rounded-full p-6 mb-6 border border-[#19c3e6]/30"
            >
              <CheckCircle className="h-12 w-12 text-[#19c3e6]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-[#f5f5f0] mb-3">¡Solicitud Enviada!</h1>
              <p className="text-[#f5f5f0]/60 mb-8 max-w-sm">
                Su solicitud de acceso de administrador ha sido registrada exitosamente. El equipo la revisará en 1-3 días hábiles.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full space-y-3"
            >
              <button
                onClick={() => navigate('/')}
                className="w-full bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] uppercase tracking-widest text-sm"
                style={{
                  boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
                }}
              >
                Volver al Inicio
              </button>

              <Link to="/login" className="w-full block">
                <button className="w-full border border-[#19c3e6]/20 hover:bg-[#19c3e6]/5 text-[#f5f5f0] font-bold py-3 rounded-lg transition-all uppercase tracking-widest text-sm">
                  Ir al Inicio de Sesión
                </button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-xs text-[#f5f5f0]/40"
            >
              Se le redirigirá automáticamente en unos segundos...
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

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
        className="w-full max-w-4xl relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Panel Lateral Informativo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:flex flex-col items-start justify-center space-y-8 p-8"
          >
            {/* Logo y Header */}
            <div className="flex items-center gap-4 mb-4">
              <TreePine className="h-8 w-8 text-[#19c3e6]" strokeWidth={3} />
              <div>
                <h2 className="text-2xl font-bold text-[#f5f5f0]">Árbol de la Ciencia</h2>
                <p className="text-xs text-[#19c3e6]/70 uppercase tracking-wider">Admin Portal</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#f5f5f0] mb-3">Solicitud de Acceso</h3>
              <p className="text-[#f5f5f0]/60 leading-relaxed text-sm">
                Complete el formulario para solicitar acceso a la plataforma. El equipo revisará su petición y le notificará por correo electrónico en 1-3 días hábiles.
              </p>
            </div>

            {/* Requisitos */}
            <div className="space-y-4 w-full">
              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded bg-[#19c3e6]/10 flex items-center justify-center text-[#19c3e6]">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#f5f5f0] mb-1">Validación de Datos</h4>
                  <p className="text-xs text-[#f5f5f0]/50">Todos los campos son obligatorios y serán verificados.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded bg-[#19c3e6]/10 flex items-center justify-center text-[#19c3e6]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#f5f5f0] mb-1">Notificación por Email</h4>
                  <p className="text-xs text-[#f5f5f0]/50">Recibirá respuesta en el email institucional.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded bg-[#19c3e6]/10 flex items-center justify-center text-[#19c3e6]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#f5f5f0] mb-1">Seguridad Garantizada</h4>
                  <p className="text-xs text-[#f5f5f0]/50">Datos encriptados y procesados de forma segura.</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div 
              className="w-full p-4 rounded-lg border border-[#19c3e6]/30"
              style={{
                background: "rgba(25, 195, 230, 0.05)"
              }}
            >
              <p className="text-[10px] uppercase tracking-widest text-[#19c3e6] font-bold mb-2">Estado del Sistema</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs text-[#f5f5f0]/60">Todos los Servicios Operacionales</span>
              </div>
            </div>

            <p className="text-[9px] text-[#f5f5f0]/20 tracking-tighter">
           © {new Date().getFullYear()} Universidad Nacional de Colombia. Todos los derechos reservados.
            </p>
          </motion.div>

          {/* FORMULARIO */}
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
            {/* Header */}
            <div 
              className="p-8 border-b border-[#19c3e6]/20"
              style={{
                background: "rgba(25, 195, 230, 0.05)"
              }}
            >
              <h2 className="text-2xl font-bold text-[#f5f5f0] mb-2">Solicitud de Acceso</h2>
              <p className="text-sm text-[#f5f5f0]/60">Todos los campos marcados con * son obligatorios</p>
            </div>

            {/* Contenido Formulario */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Error General */}
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

              {/* Nombre y Apellido */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nombre *
                  </label>
                  <input
                    name="first_name"
                    type="text"
                    placeholder="Juan"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none ${
                      errors.first_name
                        ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/20"
                        : "border-[#93bfc8]/30 focus:border-[#19c3e6] focus:ring-[#19c3e6]/20"
                    }`}
                    style={{
                      background: "rgba(26, 46, 5, 0.6)"
                    }}
                  />
                  {errors.first_name && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.first_name[0]}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Apellido *
                  </label>
                  <input
                    name="last_name"
                    type="text"
                    placeholder="Pérez"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none ${
                      errors.last_name
                        ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/20"
                        : "border-[#93bfc8]/30 focus:border-[#19c3e6] focus:ring-[#19c3e6]/20"
                    }`}
                    style={{
                      background: "rgba(26, 46, 5, 0.6)"
                    }}
                  />
                  {errors.last_name && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.last_name[0]}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Correo Institucional *
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="correo@unal.edu.co"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none ${
                    errors.email
                      ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/20"
                      : "border-[#93bfc8]/30 focus:border-[#19c3e6] focus:ring-[#19c3e6]/20"
                  }`}
                  style={{
                    background: "rgba(26, 46, 5, 0.6)"
                  }}
                />
                {errors.email && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {errors.email[0]}
                  </div>
                )}
              </motion.div>

              {/* Teléfono y Afiliación */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80">
                    Teléfono *
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none ${
                      errors.phone
                        ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/20"
                        : "border-[#93bfc8]/30 focus:border-[#19c3e6] focus:ring-[#19c3e6]/20"
                    }`}
                    style={{
                      background: "rgba(26, 46, 5, 0.6)"
                    }}
                  />
                  {errors.phone && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.phone[0]}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Afiliación *
                  </label>
                  <input
                    name="affiliation"
                    type="text"
                    placeholder="Universidad, departamento, cargo"
                    value={formData.affiliation}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none ${
                      errors.affiliation
                        ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/20"
                        : "border-[#93bfc8]/30 focus:border-[#19c3e6] focus:ring-[#19c3e6]/20"
                    }`}
                    style={{
                      background: "rgba(26, 46, 5, 0.6)"
                    }}
                  />
                  {errors.affiliation && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.affiliation[0]}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Justificación */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <label className="text-xs font-bold uppercase tracking-wider text-[#19c3e6]/80 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Justificación *
                </label>
                <textarea
                  name="justification"
                  placeholder="Explique por qué necesita acceso de administrador. Incluya su rol, responsabilidades y cómo planea usar el sistema."
                  value={formData.justification}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg text-sm placeholder:text-[#f5f5f0]/20 text-[#f5f5f0] transition-all border focus:ring-2 focus:outline-none resize-none min-h-[120px] ${
                    errors.justification
                      ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/20"
                      : "border-[#93bfc8]/30 focus:border-[#19c3e6] focus:ring-[#19c3e6]/20"
                  }`}
                  style={{
                    background: "rgba(26, 46, 5, 0.6)"
                  }}
                />
                <div className="flex items-center justify-between text-xs">
                  {errors.justification ? (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      {errors.justification[0]}
                    </div>
                  ) : (
                    <p className="text-[#f5f5f0]/50">Mínimo 50 caracteres, máximo 500</p>
                  )}
                  <p className={`font-mono ${justLength < 50 ? 'text-red-400' : justLength > 500 ? 'text-red-400' : 'text-[#19c3e6]'}`}>
                    {justLength} / 500
                  </p>
                </div>
              </motion.div>

              {/* Info del Proceso */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="p-4 rounded-lg border border-[#19c3e6]/20"
                style={{
                  background: "rgba(25, 195, 230, 0.05)"
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#19c3e6] mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-[#19c3e6] mb-1">Proceso de Solicitud</p>
                    <p className="text-[#f5f5f0]/60 text-xs">
                      Su solicitud será revisada por los administradores. El proceso toma entre 1-3 días hábiles. Recibirá una notificación por correo electrónico.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Botones */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4 space-y-3"
              >
                <button
                  type="submit"
                  disabled={requestMutation.isPending}
                  className="w-full bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
                  }}
                >
                  {requestMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1a2e05]" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Solicitud
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-[#f5f5f0]/60">
                  ¿Ya tiene una cuenta?{' '}
                  <Link 
                    to="/login" 
                    className="text-[#19c3e6] hover:text-[#19c3e6]/80 font-medium transition-colors"
                  >
                    Inicie sesión aquí
                  </Link>
                </div>
              </motion.div>
            </form>
          </motion.div>
        </div>
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

export default AdminRequest;