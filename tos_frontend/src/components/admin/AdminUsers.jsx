import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import {
  Search,
  Filter,
  Edit,
  Mail,
  AlertCircle,
  CheckCircle,
  Users,
  X,
  Copy,
  ExternalLink,
  Trash2,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editError, setEditError] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  const queryClient = useQueryClient();

  // Debounce búsqueda
  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 700);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // ===== QUERIES =====
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', debouncedSearch, roleFilter],
    queryFn: async () => {
      if (!adminAPI.getUsers) {
        return [
          {
            id: 1,
            first_name: 'Aris',
            last_name: 'Thorne',
            email: 'aris.thorne@scitree.edu',
            is_staff: true,
            user_state: 'ACTIVE',
            date_joined: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            first_name: 'Elena',
            last_name: 'Vance',
            email: 'vance.e@biotech.lab',
            is_staff: false,
            user_state: 'PENDING',
            date_joined: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            first_name: 'Julian',
            last_name: 'Graves',
            email: 'jgraves@physics.inst',
            is_staff: false,
            user_state: 'SUSPENDED',
            date_joined: new Date(Date.now() - 1400 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 4,
            first_name: 'Sarah',
            last_name: 'Jenkins',
            email: 's.jenkins@extern.com',
            is_staff: false,
            user_state: 'ACTIVE',
            date_joined: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
      }
      return await adminAPI.getUsers({ search: debouncedSearch || undefined, role: roleFilter !== 'all' ? roleFilter : undefined });
    },
  });

  const { data: invitationsData, isLoading: invitationsLoading } = useQuery({
    queryKey: ['admin-invitations'],
    queryFn: async () => {
      if (!adminAPI.getInvitations) {
        return [
          {
            id: 1,
            first_name: 'Marco',
            last_name: 'Rossi',
            email: 'marco.rossi@uniroma.it',
            role: 'user',
            token: 'inv_abc123xyz',
            is_used: false,
            state: 'PENDING',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            first_name: 'Anna',
            last_name: 'Costa',
            email: 'a.costa@polimi.it',
            role: 'administrator',
            token: 'inv_def456uvw',
            is_used: true,
            state: 'ACCEPTED',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            used_by: { email: 'anna.costa@polimi.it' },
          },
        ];
      }
      return await adminAPI.getInvitations();
    },
  });

  // Normalizar usuarios: tu backend devuelve { users: [...] }
  const users = Array.isArray(usersData?.users)
    ? usersData.users
    : Array.isArray(usersData)
    ? usersData
    : [];

  const allInvitations = invitationsData || [];

  const pendingInvitations = allInvitations.filter((inv) => inv.state === 'PENDING' || !inv.is_used);
  const usedInvitations = allInvitations.filter((inv) => inv.state === 'ACCEPTED' || inv.is_used);

  // ===== MUTATIONS =====
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => adminAPI.updateUser?.(userId, data) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUserId(null);
      setUserToEdit(null);
      setEditError(null);
    },
    onError: (error) => {
      setEditError(error.message || 'Error al actualizar el usuario');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminAPI.deleteUser?.(userId) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: (userId) => adminAPI.suspendUser?.(userId) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: (userId) => adminAPI.activateUser?.(userId) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const revokeInvitationMutation = useMutation({
    mutationFn: (invitationId) => adminAPI.revokeInvitation?.(invitationId) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] });
    },
  });

  // ===== FUNCIONES AUXILIARES =====
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;

    return formatDate(dateString);
  };

  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: 'bg-emerald-500/20 text-emerald-400',
      PENDING: 'bg-amber-500/20 text-amber-400',
      SUSPENDED: 'bg-rose-500/20 text-rose-400',
    };
    return variants[status] || 'bg-slate-500/20 text-slate-400';
  };

  const getStatusText = (status) => {
    const texts = {
      ACTIVE: 'Activo',
      PENDING: 'Pendiente',
      SUSPENDED: 'Suspendido',
    };
    return texts[status] || status;
  };

  const handleEditUser = (user) => {
    setUserToEdit({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      user_state: user.user_state,
      role: user.is_staff ? 'administrator' : 'user',
    });
    setEditingUserId(user.id);
    setEditError(null);
  };

  const handleSaveUser = () => {
    if (!userToEdit.first_name?.trim() || !userToEdit.last_name?.trim()) {
      setEditError('Nombre y apellido son requeridos');
      return;
    }

    updateUserMutation.mutate({
      userId: userToEdit.id,
      data: {
        is_staff: userToEdit.role === 'administrator',
        first_name: userToEdit.first_name.trim(),
        last_name: userToEdit.last_name.trim(),
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setUserToEdit(null);
    setEditError(null);
  };

  const updateEditField = (field, value) => {
    setUserToEdit((prev) => ({
      ...prev,
      [field]: value,
    }));
    setEditError(null);
  };

  const handleCopyToken = (token) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getInviteUrl = (token) => {
    return `${window.location.origin}/register?token=${token}`;
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

  if (usersLoading || invitationsLoading) {
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
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-4xl md:text-3xl font-black text-[#f5f5f0] tracking-tight">
          Gestión de Usuarios e Invitaciones
        </h1>
        <p className="text-[#f5f5f0]/60 text-sm md:text-base mt-2">
          Administrar usuarios registrados e invitaciones pendientes
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { title: 'Usuarios Registrados', count: users.length, icon: Users, color: 'text-[#19c3e6]', bg: 'rgba(25, 195, 230, 0.1)' },
          { title: 'Invitaciones Pendientes', count: pendingInvitations.length, icon: Clock, color: 'text-amber-400', bg: 'rgba(251, 146, 60, 0.1)' },
          { title: 'Invitaciones Aceptadas', count: usedInvitations.length, icon: CheckCircle, color: 'text-emerald-400', bg: 'rgba(16, 185, 129, 0.1)' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="p-6 rounded-xl border border-[#19c3e6]/20 transition-all cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#f5f5f0]/60 text-xs font-medium uppercase tracking-wider">{stat.title}</p>
                  <p className="text-4xl font-black text-[#f5f5f0] mt-2">{stat.count}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ background: stat.bg }}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div variants={itemVariants} className="flex gap-2 border-b border-[#19c3e6]/10 pb-4">
        {[
          { id: 'users', label: `Usuarios (${users.length})`, icon: Users },
          { id: 'pending', label: `Pendientes (${pendingInvitations.length})`, icon: Clock },
          { id: 'accepted', label: `Aceptadas (${usedInvitations.length})`, icon: CheckCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-[#19c3e6] text-[#1a2e05]'
                  : 'border border-[#19c3e6]/20 hover:border-[#19c3e6] text-[#f5f5f0]/70 hover:text-[#f5f5f0]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Filters */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-xl border border-[#19c3e6]/20"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f5f5f0]/40" />
                  <input
                    type="text"
                    placeholder="Nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#19c3e6] focus:outline-none transition-all text-[#f5f5f0] placeholder-[#f5f5f0]/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                  Rol
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2 text-sm text-[#f5f5f0] focus:border-[#19c3e6] focus:outline-none transition-all appearance-none font-bold"
                >
                  <option value="all" className="bg-[#0f1513]">Todos</option>
                  <option value="user" className="bg-[#0f1513]">Usuario</option>
                  <option value="administrator" className="bg-[#0f1513]">Administrador</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2 text-sm text-[#f5f5f0] focus:border-[#19c3e6] focus:outline-none transition-all appearance-none font-bold"
                >
                  <option value="all" className="bg-[#0f1513]">Todos</option>
                  <option value="ACTIVE" className="bg-[#0f1513]">Activos</option>
                  <option value="PENDING" className="bg-[#0f1513]">Pendientes</option>
                  <option value="SUSPENDED" className="bg-[#0f1513]">Suspendidos</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Users List */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-[#19c3e6]/20 overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="p-6 border-b border-[#19c3e6]/10">
              <h2 className="text-lg font-black text-[#f5f5f0]">Usuarios Registrados</h2>
            </div>

            <div className="p-6 space-y-4">
              {users.length > 0 ? (
                users.map((user, idx) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-lg border border-[#19c3e6]/10 hover:border-[#19c3e6]/30 transition-all hover:bg-[#19c3e6]/5"
                  >
                    {editError && editingUserId === user.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-sm"
                      >
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {editError}
                      </motion.div>
                    )}

                    <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-[#19c3e6]/20 flex items-center justify-center text-[#19c3e6] font-black text-xs flex-shrink-0">
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            {editingUserId === user.id && userToEdit ? (
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <input
                                  type="text"
                                  value={userToEdit.first_name}
                                  onChange={(e) => updateEditField('first_name', e.target.value)}
                                  className="bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded px-2 py-1 text-xs text-[#f5f5f0]"
                                  disabled={updateUserMutation.isPending}
                                />
                                <input
                                  type="text"
                                  value={userToEdit.last_name}
                                  onChange={(e) => updateEditField('last_name', e.target.value)}
                                  className="bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded px-2 py-1 text-xs text-[#f5f5f0]"
                                  disabled={updateUserMutation.isPending}
                                />
                              </div>
                            ) : (
                              <>
                                <h3 className="text-sm font-bold text-[#f5f5f0] truncate">
                                  {user.first_name} {user.last_name}
                                </h3>
                                <p className="text-xs text-[#f5f5f0]/60 truncate">{user.email}</p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(user.user_state)}`}>
                            {getStatusText(user.user_state)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#19c3e6]/30 bg-[#19c3e6]/10 text-[#19c3e6]">
                            {user.is_staff ? 'Admin' : 'Usuario'}
                          </span>
                          <span className="text-[10px] text-[#f5f5f0]/50">
                            {formatRelativeDate(user.date_joined)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        {editingUserId === user.id && userToEdit ? (
                          <>
                            <div className="grid grid-cols-1 gap-2">
                              <select
                                value={userToEdit.role}
                                onChange={(e) => updateEditField('role', e.target.value)}
                                disabled={updateUserMutation.isPending}
                                className="bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded px-3 py-1.5 text-xs text-[#f5f5f0] focus:border-[#19c3e6] focus:outline-none appearance-none font-bold"
                              >
                                <option value="user" className="bg-[#0f1513]">Usuario</option>
                                <option value="administrator" className="bg-[#0f1513]">Administrador</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSaveUser}
                                disabled={updateUserMutation.isPending}
                                className="flex-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs rounded-lg transition-all disabled:opacity-50 uppercase tracking-widest"
                              >
                                {updateUserMutation.isPending ? 'Guardando...' : 'Guardar'}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCancelEdit}
                                disabled={updateUserMutation.isPending}
                                className="px-3 py-1.5 border border-[#19c3e6]/20 hover:border-[#19c3e6] text-[#f5f5f0]/60 hover:text-[#f5f5f0] font-bold text-xs rounded-lg transition-all disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </>
                        ) : (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleEditUser(user)}
                              className="flex items-center justify-center gap-2 px-3 py-1.5 border border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10 text-[#f5f5f0] font-bold text-xs rounded-lg transition-all w-full"
                            >
                              <Edit className="h-3 w-3" />
                              Editar
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (window.confirm(user.user_state === 'SUSPENDED' ? '¿Activar usuario?' : '¿Suspender usuario?')) {
                                  if (user.user_state === 'SUSPENDED') {
                                    activateUserMutation.mutate(user.id);
                                  } else {
                                    suspendUserMutation.mutate(user.id);
                                  }
                                }
                              }}
                              disabled={suspendUserMutation.isPending || activateUserMutation.isPending}
                              className={`flex items-center justify-center gap-2 px-3 py-1.5 font-bold text-xs rounded-lg transition-all w-full disabled:opacity-50 uppercase tracking-widest ${
                                user.user_state === 'SUSPENDED'
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {user.user_state === 'SUSPENDED' ? 'Activar' : 'Suspender'}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (window.confirm('¿Eliminar usuario?')) {
                                  deleteUserMutation.mutate(user.id);
                                }
                              }}
                              disabled={deleteUserMutation.isPending}
                              className="flex items-center justify-center gap-2 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs rounded-lg transition-all disabled:opacity-50 uppercase tracking-widest w-full"
                            >
                              <Trash2 className="h-3 w-3" />
                              {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div variants={itemVariants} className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-[#f5f5f0]/20" />
                  <p className="text-[#f5f5f0]/60 font-bold">No hay usuarios para mostrar</p>
                  <p className="text-[#f5f5f0]/40 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* PENDING INVITATIONS TAB */}
      {activeTab === 'pending' && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-[#19c3e6]/20 overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="p-6 border-b border-[#19c3e6]/10">
              <h2 className="text-lg font-black text-[#f5f5f0]">Invitaciones Pendientes</h2>
            </div>

            <div className="p-6 space-y-4">
              {pendingInvitations.length > 0 ? (
                pendingInvitations.map((inv, idx) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-lg border border-amber-500/30 hover:border-amber-500/50 transition-all hover:bg-amber-500/5"
                  >
                    <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-black text-xs flex-shrink-0">
                            {inv.first_name.charAt(0)}{inv.last_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[#f5f5f0] truncate">
                              {inv.first_name} {inv.last_name}
                            </h3>
                            <p className="text-xs text-[#f5f5f0]/60 truncate">{inv.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-500/30 bg-amber-500/20 text-amber-400">
                            Pendiente
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#19c3e6]/30 bg-[#19c3e6]/10 text-[#19c3e6]">
                            {inv.role === 'administrator' ? 'Admin' : 'Usuario'}
                          </span>
                          <span className="text-[10px] text-[#f5f5f0]/50">
                            {formatRelativeDate(inv.created_at)}
                          </span>
                        </div>

                        <div className="mt-3 p-3 bg-[#0f1513]/50 border border-[#19c3e6]/10 rounded text-xs text-[#f5f5f0]/70 break-all">
                          {getInviteUrl(inv.token)}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCopyToken(inv.token)}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#19c3e6]/20 hover:bg-[#19c3e6]/30 text-[#19c3e6] font-bold text-xs rounded-lg transition-all w-full"
                        >
                          {copiedToken === inv.token ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Token
                            </>
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCopyToken(getInviteUrl(inv.token))}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 border border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10 text-[#f5f5f0] font-bold text-xs rounded-lg transition-all w-full"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Enlace
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (window.confirm('¿Revocar invitación?')) {
                              revokeInvitationMutation.mutate(inv.id);
                            }
                          }}
                          disabled={revokeInvitationMutation.isPending}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs rounded-lg transition-all disabled:opacity-50 w-full"
                        >
                          <X className="h-3 w-3" />
                          Revocar
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div variants={itemVariants} className="text-center py-12">
                  <Clock className="h-16 w-16 mx-auto mb-4 text-[#f5f5f0]/20" />
                  <p className="text-[#f5f5f0]/60 font-bold">No hay invitaciones pendientes</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ACCEPTED INVITATIONS TAB */}
      {activeTab === 'accepted' && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-[#19c3e6]/20 overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="p-6 border-b border-[#19c3e6]/10">
              <h2 className="text-lg font-black text-[#f5f5f0]">Invitaciones Aceptadas</h2>
            </div>

            <div className="p-6 space-y-4">
              {usedInvitations.length > 0 ? (
                usedInvitations.map((inv, idx) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-lg border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover:bg-emerald-500/5"
                  >
                    <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs flex-shrink-0">
                            {inv.first_name.charAt(0)}{inv.last_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[#f5f5f0] truncate">
                              {inv.first_name} {inv.last_name}
                            </h3>
                            <p className="text-xs text-[#f5f5f0]/60 truncate">{inv.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
                            Aceptada
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#19c3e6]/30 bg-[#19c3e6]/10 text-[#19c3e6]">
                            {inv.role === 'administrator' ? 'Admin' : 'Usuario'}
                          </span>
                          <span className="text-[10px] text-[#f5f5f0]/50">
                            {formatRelativeDate(inv.created_at)}
                          </span>
                        </div>

                        {inv.used_by && (
                          <div className="mt-3 p-3 bg-[#0f1513]/50 border border-[#19c3e6]/10 rounded text-xs text-[#f5f5f0]/70">
                            <span className="font-bold text-[#19c3e6]">Aceptada por:</span> {inv.used_by.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div variants={itemVariants} className="text-center py-12">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-[#f5f5f0]/20" />
                  <p className="text-[#f5f5f0]/60 font-bold">No hay invitaciones aceptadas</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminUsers;