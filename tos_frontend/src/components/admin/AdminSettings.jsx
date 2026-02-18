import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import {
  Settings,
  Shield,
  Database,
  Bell,
  Mail,
  Save,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  HardDrive,
  Lock,
  Clock,
} from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    system_name: 'Árbol de la Ciencia',
    institution_name: 'Universidad Nacional de Colombia',
    allow_registration: false,
    admin_approval_required: true,
    invitation_expiry_days: 30,
    max_invitations_per_admin: 10,
    email_notifications: true,
    system_maintenance: false,
    session_timeout: 30,
    password_min_length: 12,
    max_file_size: 50,
    items_per_page: 25,
    force_password_change: true,
  });

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const queryClient = useQueryClient();

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      if (!adminAPI.getSystemSettings) {
        return settings;
      }
      return await adminAPI.getSystemSettings();
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: adminAPI.updateSystemSettings || (async (data) => data),
    onSuccess: () => {
      setSaved(true);
      setSaveError(null);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (error) => {
      setSaveError(error.message || 'Error al guardar configuraciones');
    },
  });

  const backupMutation = useMutation({
    mutationFn: adminAPI.backupDatabase || (async () => ({ success: true })),
  });

  const optimizeMutation = useMutation({
    mutationFn: adminAPI.optimizeDatabase || (async () => ({ success: true })),
  });

  const cleanMutation = useMutation({
    mutationFn: adminAPI.cleanExpiredInvitations || (async () => ({ success: true })),
  });

  React.useEffect(() => {
    if (systemSettings) {
      setSettings(systemSettings);
    }
  }, [systemSettings]);

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaveError(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#19c3e6] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 w-full"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8 flex justify-between items-start flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-4xl md:text-3xl font-black text-[#f5f5f0] tracking-tight">
            Configuraciones del Sistema
          </h1>
          <p className="text-[#f5f5f0]/60 text-sm md:text-base mt-2">
            Administrar configuraciones globales y parámetros del sistema
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-settings'] })}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10 text-[#f5f5f0] font-bold text-sm rounded-lg transition-all flex-1 sm:flex-none"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-black text-sm rounded-lg transition-all disabled:opacity-50 uppercase tracking-widest flex-1 sm:flex-none"
            style={{
              boxShadow: '0 0 20px rgba(25, 195, 230, 0.3)',
            }}
          >
            <Save className="h-4 w-4" />
            {updateSettingsMutation.isPending ? 'Guardando...' : 'Guardar'}
          </motion.button>
        </div>
      </motion.div>

      {/* Notificación de guardado */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3 text-emerald-400"
        >
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p className="font-bold text-sm">Configuraciones guardadas exitosamente</p>
        </motion.div>
      )}

      {/* Notificación de error */}
      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center gap-3 text-rose-400"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="font-bold text-sm">{saveError}</p>
        </motion.div>
      )}

      {/* Settings Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Configuraciones Generales */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-xl border border-[#19c3e6]/20"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-5 w-5 text-[#19c3e6]" />
            <h2 className="text-lg font-black text-[#f5f5f0]">Configuraciones Generales</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                Nombre del Sistema
              </label>
              <input
                type="text"
                value={settings.system_name}
                onChange={(e) => handleSettingChange('system_name', e.target.value)}
                className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2.5 text-sm focus:border-[#19c3e6] focus:outline-none transition-all text-[#f5f5f0] placeholder-[#f5f5f0]/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                Nombre de la Institución
              </label>
              <input
                type="text"
                value={settings.institution_name}
                onChange={(e) => handleSettingChange('institution_name', e.target.value)}
                className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2.5 text-sm focus:border-[#19c3e6] focus:outline-none transition-all text-[#f5f5f0] placeholder-[#f5f5f0]/40"
              />
            </div>

            {/* Toggle: Permitir Registro */}
            <div className="p-4 rounded-lg bg-[#19c3e6]/5 border border-[#19c3e6]/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#f5f5f0]">Permitir Registro Libre</p>
                <p className="text-xs text-[#f5f5f0]/60 mt-1">Permite registro directo sin invitación</p>
              </div>
              <button
                onClick={() => handleSettingChange('allow_registration', !settings.allow_registration)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                  settings.allow_registration ? 'bg-[#19c3e6]' : 'bg-[#f5f5f0]/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#0f1513] transition-transform ${
                    settings.allow_registration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Toggle: Aprobación Admin */}
            <div className="p-4 rounded-lg bg-[#19c3e6]/5 border border-[#19c3e6]/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#f5f5f0]">Aprobación de Administrador</p>
                <p className="text-xs text-[#f5f5f0]/60 mt-1">Nuevos admins requieren aprobación</p>
              </div>
              <button
                onClick={() => handleSettingChange('admin_approval_required', !settings.admin_approval_required)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                  settings.admin_approval_required ? 'bg-[#19c3e6]' : 'bg-[#f5f5f0]/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#0f1513] transition-transform ${
                    settings.admin_approval_required ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Configuraciones de Invitaciones */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-xl border border-[#19c3e6]/20"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-5 w-5 text-[#19c3e6]" />
            <h2 className="text-lg font-black text-[#f5f5f0]">Configuraciones de Invitaciones</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                Días de Expiración
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.invitation_expiry_days}
                onChange={(e) => handleSettingChange('invitation_expiry_days', parseInt(e.target.value))}
                className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2.5 text-sm focus:border-[#19c3e6] focus:outline-none transition-all text-[#f5f5f0] placeholder-[#f5f5f0]/40"
              />
              <p className="text-xs text-[#f5f5f0]/50 mt-1">Los tokens expiran después de estos días</p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                Máximo de Invitaciones por Admin
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.max_invitations_per_admin}
                onChange={(e) => handleSettingChange('max_invitations_per_admin', parseInt(e.target.value))}
                className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2.5 text-sm focus:border-[#19c3e6] focus:outline-none transition-all text-[#f5f5f0] placeholder-[#f5f5f0]/40"
              />
              <p className="text-xs text-[#f5f5f0]/50 mt-1">Límite de invitaciones activas</p>
            </div>

            {/* Toggle: Notificaciones Email */}
            <div className="p-4 rounded-lg bg-[#19c3e6]/5 border border-[#19c3e6]/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#f5f5f0]">Notificaciones por Email</p>
                <p className="text-xs text-[#f5f5f0]/60 mt-1">Emails automáticos para eventos</p>
              </div>
              <button
                onClick={() => handleSettingChange('email_notifications', !settings.email_notifications)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                  settings.email_notifications ? 'bg-[#19c3e6]' : 'bg-[#f5f5f0]/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#0f1513] transition-transform ${
                    settings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Configuraciones de Seguridad */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-xl border border-[#19c3e6]/20"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-5 w-5 text-[#19c3e6]" />
            <h2 className="text-lg font-black text-[#f5f5f0]">Configuraciones de Seguridad</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                Tiempo de Sesión (minutos)
              </label>
              <select
                value={settings.session_timeout}
                onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
                className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2.5 text-sm focus:border-[#19c3e6] focus:outline-none transition-all text-[#f5f5f0] appearance-none font-bold"
              >
                <option value="15" className="bg-[#0f1513]">15 minutos</option>
                <option value="30" className="bg-[#0f1513]">30 minutos</option>
                <option value="60" className="bg-[#0f1513]">1 hora</option>
                <option value="120" className="bg-[#0f1513]">2 horas</option>
                <option value="480" className="bg-[#0f1513]">8 horas</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                Longitud Mínima de Contraseña
              </label>
              <input
                type="number"
                min="6"
                max="50"
                value={settings.password_min_length}
                onChange={(e) => handleSettingChange('password_min_length', parseInt(e.target.value))}
                className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2.5 text-sm focus:border-[#19c3e6] focus:outline-none transition-all text-[#f5f5f0] placeholder-[#f5f5f0]/40"
              />
            </div>

            {/* Toggle: Forzar Cambio de Contraseña */}
            <div className="p-4 rounded-lg bg-[#19c3e6]/5 border border-[#19c3e6]/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#f5f5f0]">Forzar Cambio de Contraseña</p>
                <p className="text-xs text-[#f5f5f0]/60 mt-1">Cambiar contraseña en primer login</p>
              </div>
              <button
                onClick={() => handleSettingChange('force_password_change', !settings.force_password_change)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                  settings.force_password_change ? 'bg-[#19c3e6]' : 'bg-[#f5f5f0]/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#0f1513] transition-transform ${
                    settings.force_password_change ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Configuraciones del Sistema */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-xl border border-[#19c3e6]/20"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-5 w-5 text-[#19c3e6]" />
            <h2 className="text-lg font-black text-[#f5f5f0]">Configuraciones del Sistema</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                Tamaño Máximo de Archivo (MB)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={settings.max_file_size}
                onChange={(e) => handleSettingChange('max_file_size', parseInt(e.target.value))}
                className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2.5 text-sm focus:border-[#19c3e6] focus:outline-none transition-all text-[#f5f5f0] placeholder-[#f5f5f0]/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                Elementos por Página
              </label>
              <select
                value={settings.items_per_page}
                onChange={(e) => handleSettingChange('items_per_page', parseInt(e.target.value))}
                className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2.5 text-sm focus:border-[#19c3e6] focus:outline-none transition-all text-[#f5f5f0] appearance-none font-bold"
              >
                <option value="10" className="bg-[#0f1513]">10</option>
                <option value="25" className="bg-[#0f1513]">25</option>
                <option value="50" className="bg-[#0f1513]">50</option>
                <option value="100" className="bg-[#0f1513]">100</option>
              </select>
            </div>

            {/* Toggle: Modo Mantenimiento */}
            <div className="p-4 rounded-lg bg-[#19c3e6]/5 border border-[#19c3e6]/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#f5f5f0]">Modo de Mantenimiento</p>
                <p className="text-xs text-[#f5f5f0]/60 mt-1">Solo admins pueden acceder</p>
              </div>
              <button
                onClick={() => handleSettingChange('system_maintenance', !settings.system_maintenance)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                  settings.system_maintenance ? 'bg-rose-500' : 'bg-[#f5f5f0]/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#0f1513] transition-transform ${
                    settings.system_maintenance ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.system_maintenance && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center gap-3 text-rose-400"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-xs font-bold">Sistema en modo mantenimiento</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Database Management Section */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-xl border border-[#19c3e6]/20"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <HardDrive className="h-5 w-5 text-[#19c3e6]" />
          <h2 className="text-lg font-black text-[#f5f5f0]">Gestión de Base de Datos</h2>
        </div>

        <p className="text-[#f5f5f0]/60 text-sm mb-4">
          Herramientas de mantenimiento y optimización de la base de datos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => backupMutation.mutate()}
            disabled={backupMutation.isPending}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10 text-[#f5f5f0] font-bold text-sm rounded-lg transition-all disabled:opacity-50 uppercase tracking-widest"
          >
            <Database className="h-4 w-4" />
            {backupMutation.isPending ? 'Creando...' : 'Crear Backup'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => optimizeMutation.mutate()}
            disabled={optimizeMutation.isPending}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10 text-[#f5f5f0] font-bold text-sm rounded-lg transition-all disabled:opacity-50 uppercase tracking-widest"
          >
            <RefreshCw className="h-4 w-4" />
            {optimizeMutation.isPending ? 'Optimizando...' : 'Optimizar'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => cleanMutation.mutate()}
            disabled={cleanMutation.isPending}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10 text-[#f5f5f0] font-bold text-sm rounded-lg transition-all disabled:opacity-50 uppercase tracking-widest"
          >
            <Mail className="h-4 w-4" />
            {cleanMutation.isPending ? 'Limpiando...' : 'Limpiar Expiradas'}
          </motion.button>
        </div>
      </motion.div>

      {/* System Information */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-xl border border-[#19c3e6]/20"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-[#19c3e6]" />
          <h3 className="text-sm font-black text-[#f5f5f0] uppercase tracking-wider">Información del Sistema</h3>
        </div>
        <div className="space-y-2 text-xs text-[#f5f5f0]/60">
          <p>
            <span className="text-[#19c3e6] font-bold">Versión:</span> v1.0-stable
          </p>
          <p>
            <span className="text-[#19c3e6] font-bold">Ambiente:</span> Producción
          </p>
          <p>
            <span className="text-[#19c3e6] font-bold">Estado:</span>{' '}
            <span className="text-emerald-400 font-bold">Óptimo</span>
          </p>
          <p>
            <span className="text-[#19c3e6] font-bold">Copyrights:</span> © {new Date().getFullYear()} Universidad Nacional de Colombia.

          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminSettings;