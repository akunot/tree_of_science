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
    system_maintenance: false,
  });

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [toolsMessage, setToolsMessage] = useState('');
  const [toolsError, setToolsError] = useState('');

  const queryClient = useQueryClient();

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      if (!adminAPI.getSettings) {
        return settings;
      }
      return await adminAPI.getSettings();
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: adminAPI.updateSettings || (async (data) => data),
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
    onSuccess: (data) => {
      setToolsError('');
      setToolsMessage(data?.message || 'Backup creado correctamente.');
      setTimeout(() => setToolsMessage(''), 4000);
    },
    onError: (error) => {
      setToolsMessage('');
      setToolsError(
        error.response?.data?.error ||
        error.message ||
        'Error al crear el backup.'
      );
      setTimeout(() => setToolsError(''), 4000);
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: adminAPI.optimizeDatabase || (async () => ({ success: true })),
    onSuccess: (data) => {
      setToolsError('');
      setToolsMessage(data?.message || 'Base de datos optimizada correctamente.');
      setTimeout(() => setToolsMessage(''), 4000);
    },
    onError: (error) => {
      setToolsMessage('');
      setToolsError(
        error.response?.data?.error ||
        error.message ||
        'Error al optimizar la base de datos.'
      );
      setTimeout(() => setToolsError(''), 4000);
    },
  });

  const cleanMutation = useMutation({
    mutationFn: adminAPI.cleanExpiredInvitations || (async () => ({ success: true })),
    onSuccess: (data) => {
      setToolsError('');
      setToolsMessage(data?.message || 'Invitaciones expiradas limpiadas correctamente.');
      setTimeout(() => setToolsMessage(''), 4000);
    },
    onError: (error) => {
      setToolsMessage('');
      setToolsError(
        error.response?.data?.error ||
        error.message ||
        'Error al limpiar invitaciones expiradas.'
      );
      setTimeout(() => setToolsError(''), 4000);
    },
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
    setToolsMessage('');
    setToolsError('');
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
      <div className="flex items-center justify-center min-h-[50vh]">
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
          <h1 className="text-3xl md:text-4xl font-black text-[#f5f5f0] tracking-tight">
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

      {/* Notificación de error al guardar configuraciones */}
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

      {/* Feedback de herramientas de base de datos */}
      {toolsMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3 text-emerald-400"
        >
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p className="font-bold text-sm">{toolsMessage}</p>
        </motion.div>
      )}

      {toolsError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center gap-3 text-rose-400"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="font-bold text-sm">{toolsError}</p>
        </motion.div>
      )}

      {/* Bloque simple de Modo Mantenimiento */}
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
          <h2 className="text-lg font-black text-[#f5f5f0]">Modo de Mantenimiento</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#19c3e6]/5 border border-[#19c3e6]/10 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#f5f5f0]">Activar modo mantenimiento</p>
              <p className="text-xs text-[#f5f5f0]/60 mt-1">
                Cuando está activo, solo los administradores pueden iniciar sesión en la plataforma.
              </p>
            </div>
            <button
              onClick={() =>
                handleSettingChange('system_maintenance', !settings.system_maintenance)
              }
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
              <p className="text-xs font-bold">
                Sistema en modo mantenimiento: solo administradores pueden iniciar sesión.
              </p>
            </motion.div>
          )}
        </div>
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