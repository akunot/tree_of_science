import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import {
  Plus,
  Copy,
  Trash2,
  Mail,
  ExternalLink,
  User,
  AlertCircle,
  CheckCircle,
  Filter,
  Send,
  Clock,
  X,
} from 'lucide-react';

const AdminInvitations = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user'
  });
  const [copiedToken, setCopiedToken] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ['admin-invitations'],
    queryFn: async () => {
      if (!adminAPI.getInvitations) {
        return [
          {
            id: 1,
            first_name: 'Elena',
            last_name: 'Kostic',
            email: 'elena.k@biolab.xyz',
            role: 'user',
            token: 'inv_abc123xyz789',
            status: 'active',
            is_used: false,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            expires_at: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            first_name: 'Marcus',
            last_name: 'Low',
            email: 'm.low@university.edu',
            role: 'user',
            token: 'inv_def456uvw012',
            status: 'used',
            is_used: true,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            first_name: 'Jared',
            last_name: 'Weiss',
            email: 'weiss@genetech.com',
            role: 'user',
            token: 'inv_ghi789jkl345',
            status: 'expired',
            is_used: false,
            created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
            expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 4,
            first_name: 'Sarah',
            last_name: 'Miller',
            email: 'sarah@biohub.org',
            role: 'user',
            token: 'inv_mno012pqr678',
            status: 'active',
            is_used: false,
            created_at: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
      }
      return await adminAPI.getInvitations();
    },
  });

  const createInvitationMutation = useMutation({
    mutationFn: adminAPI.createInvitation || (async (data) => ({ ...data, id: Date.now() })),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-invitations']);
      setShowCreateForm(false);
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'user',
      });
    },
    onError: (error) => {
      console.error('Error creating invitation:', error);
    },
  });

  const revokeInvitationMutation = useMutation({
    mutationFn: adminAPI.revokeInvitation || (async (id) => ({ id })),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-invitations']);
    },
  });

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
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;

    return formatDate(dateString);
  };

  const getStatusInfo = (invitation) => {
    if (invitation.is_used) {
      return { badge: 'bg-emerald-500/20 text-emerald-400', text: 'Usada', icon: CheckCircle };
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return { badge: 'bg-amber-500/20 text-amber-400', text: 'Expirada', icon: Clock };
    }

    return { badge: 'bg-[#19c3e6]/20 text-[#19c3e6]', text: 'Activa', icon: Mail };
  };

  const handleCreateInvitation = (e) => {
    e.preventDefault();
    if (!formData.email.includes('@')) {
      alert('Ingrese un correo electrónico válido.');
      return;
    }
    createInvitationMutation.mutate(formData);
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

  const filteredInvitations = invitations
    ?.filter((invitation) => {
      // Filtro por estado
      if (statusFilter === 'all') return true;
      if (statusFilter === 'used') return invitation.is_used;
      const isExpired =
        invitation.expires_at && new Date(invitation.expires_at) < new Date();
      if (statusFilter === 'expired') return isExpired;
      if (statusFilter === 'active') return !invitation.is_used && !isExpired;
      return true;
    })
    .filter((invitation) => {
      // Filtro por texto (nombre o email)
      if (!searchText) return true;
      const term = searchText.toLowerCase();
      const fullName = `${invitation.first_name || ''} ${invitation.last_name || ''}`.toLowerCase();
      return (
        fullName.includes(term) ||
        invitation.email?.toLowerCase().includes(term)
      );
    }) || [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 w-full"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl md:text-3xl font-black text-[#f5f5f0] tracking-tight">
            Gestión de Invitaciones
          </h1>
          <p className="text-[#f5f5f0]/60 text-sm md:text-base mt-2">
            Crear y administrar invitaciones para nuevos investigadores
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-5 py-3 bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-black uppercase tracking-widest text-sm rounded-lg transition-all"
          style={{
            boxShadow: '0 0 20px rgba(25, 195, 230, 0.3)',
          }}
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Nueva Invitación</span>
          <span className="sm:hidden">Nueva</span>
        </motion.button>
      </motion.div>

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl border border-[#19c3e6]/20"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-[#f5f5f0]">Crear Nueva Invitación</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(false)}
              className="p-1 hover:bg-[#19c3e6]/10 rounded-lg text-[#19c3e6] transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          <form onSubmit={handleCreateInvitation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Juan"
                  required
                  className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2.5 text-sm text-[#f5f5f0] placeholder-[#f5f5f0]/40 focus:border-[#19c3e6] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Pérez"
                  required
                  className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2.5 text-sm text-[#f5f5f0] placeholder-[#f5f5f0]/40 focus:border-[#19c3e6] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="investigador@universidad.edu.co"
                required
                className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2.5 text-sm text-[#f5f5f0] placeholder-[#f5f5f0]/40 focus:border-[#19c3e6] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#f5f5f0]/70 uppercase tracking-wider block mb-2">
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-4 py-2.5 text-sm text-[#f5f5f0] focus:border-[#19c3e6] focus:outline-none transition-all appearance-none"
              >
                <option value="user" className="bg-[#0f1513]">Usuario</option>
                <option value="administrator" className="bg-[#0f1513]">Administrador</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={createInvitationMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-black uppercase tracking-widest text-sm rounded-lg transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {createInvitationMutation.isPending ? 'Creando...' : 'Crear Invitación'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10 text-[#f5f5f0] font-bold uppercase tracking-widest text-sm rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
                Cancelar
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Invitations List */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-[#19c3e6]/20 overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#19c3e6]/10 flex items-center justify-between flex-col md:flex-row gap-4">
          <div>
            <h2 className="text-[#f5f5f0] font-black">Invitaciones ({filteredInvitations.length})</h2>
            <p className="text-xs text-[#f5f5f0]/60 mt-1">Lista de todas las invitaciones creadas</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f5f5f0]/40" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#19c3e6] focus:outline-none transition-all text-[#f5f5f0] placeholder-[#f5f5f0]/40 md:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-3 py-2 text-sm text-[#f5f5f0] focus:border-[#19c3e6] focus:outline-none transition-all appearance-none font-bold"
            >
              <option value="all" className="bg-[#0f1513]">Todas</option>
              <option value="active" className="bg-[#0f1513]">Activas</option>
              <option value="used" className="bg-[#0f1513]">Usadas</option>
              <option value="expired" className="bg-[#0f1513]">Expiradas</option>
            </select>
          </div>
        </div>

        {/* Invitations List */}
        <div className="p-6 space-y-4">
          {filteredInvitations.length > 0 ? (
            filteredInvitations.map((invitation, idx) => {
              const statusInfo = getStatusInfo(invitation);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={invitation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-lg border border-[#19c3e6]/10 hover:border-[#19c3e6]/30 transition-all hover:bg-[#19c3e6]/5"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-lg bg-[#19c3e6]/20 flex items-center justify-center text-[#19c3e6] font-black text-xs flex-shrink-0">
                      {invitation.first_name.charAt(0)}{invitation.last_name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[#f5f5f0]">
                          {invitation.first_name} {invitation.last_name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusInfo.badge} flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.text}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#19c3e6]/30 bg-[#19c3e6]/10 text-[#19c3e6]">
                          {invitation.role === 'administrator' ? 'Admin' : 'Usuario'}
                        </span>
                      </div>
                      <p className="text-xs text-[#f5f5f0]/60 truncate">{invitation.email}</p>
                      <p className="text-[10px] text-[#f5f5f0]/50 mt-1">Creada: {formatRelativeDate(invitation.created_at)}</p>
                    </div>

                    {/* Actions */}
                    {!invitation.is_used && (
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopyToken(invitation.token)}
                          className="p-2 rounded-lg hover:bg-[#19c3e6]/20 text-[#19c3e6] transition-colors"
                          title="Copiar token"
                        >
                          {copiedToken === invitation.token ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopyToken(getInviteUrl(invitation.token))}
                          className="p-2 rounded-lg hover:bg-[#19c3e6]/20 text-[#19c3e6] transition-colors"
                          title="Copiar enlace"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (window.confirm('¿Está seguro de revocar esta invitación?')) {
                              revokeInvitationMutation.mutate(invitation.id);
                            }
                          }}
                          disabled={revokeInvitationMutation.isPending}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
                          title="Revocar invitación"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Token/Link Details */}
                  {!invitation.is_used && (
                    <div className="pt-4 border-t border-[#19c3e6]/10 space-y-2">
                      <div className="text-[10px] space-y-1">
                        <p className="text-[#f5f5f0]/60 uppercase tracking-wider font-bold">Token:</p>
                        <code className="block bg-[#0f1513]/50 border border-[#19c3e6]/20 rounded px-3 py-2 text-[#19c3e6] font-mono break-all">
                          {invitation.token}
                        </code>
                      </div>
                      <div className="text-[10px] space-y-1">
                        <p className="text-[#f5f5f0]/60 uppercase tracking-wider font-bold">Enlace de invitación:</p>
                        <a
                          href={getInviteUrl(invitation.token)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-[#0f1513]/50 border border-[#19c3e6]/20 rounded px-3 py-2 text-[#19c3e6] hover:text-[#19c3e6]/80 font-mono break-all hover:underline transition-colors"
                        >
                          {getInviteUrl(invitation.token)}
                        </a>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <motion.div
              variants={itemVariants}
              className="text-center py-12"
            >
              <Mail className="h-16 w-16 mx-auto mb-4 text-[#f5f5f0]/20" />
              <p className="text-[#f5f5f0]/60 font-bold">No hay invitaciones para mostrar</p>
              <p className="text-[#f5f5f0]/40 text-sm mt-1">
                Haz clic en "Nueva Invitación" para crear la primera
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {invitations && invitations.length > 0 && (
          <div className="p-4 bg-[#0f1513]/30 border-t border-[#19c3e6]/10 flex items-center justify-between text-[11px] text-[#f5f5f0]/60 flex-col sm:flex-row gap-4">
            <p>Mostrando <span className="font-bold text-[#19c3e6]">{filteredInvitations.length}</span> de <span className="font-bold text-[#19c3e6]">{invitations.length}</span> invitaciones</p>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 rounded border border-[#19c3e6]/20 hover:bg-[#19c3e6]/10 text-[#f5f5f0]/60 hover:text-[#f5f5f0] transition-all disabled:opacity-30 font-bold"
              >
                Anterior
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 rounded border border-[#19c3e6] text-[#19c3e6] hover:bg-[#19c3e6]/10 transition-all font-bold"
              >
                Siguiente
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminInvitations;