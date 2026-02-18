import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import {
  Users,
  UserPlus,
  Mail,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
} from 'lucide-react';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const fallback = {
        total_users: 1284,
        admin_users: 12,
        active_invitations: 86,
        pending_requests: 24,
        users_by_status: {
          ACTIVE: 1100,
          PENDING: 120,
          SUSPENDED: 45,
          INVITED: 19,
        },
      };

      if (!adminAPI.getStats) {
        return fallback;
      }

      try {
        const data = await adminAPI.getStats();
        if (!data) {
          console.warn('adminAPI.getStats devolvió un valor inesperado, usando fallback');
          return fallback;
        }
        return data;
      } catch (error) {
        console.error('Error obteniendo admin stats, usando datos de ejemplo:', error);
        return fallback;
      }
    },
  });

  const { data: adminRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: () => adminAPI.getAdminRequests(),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => adminAPI.reviewRequest(id, { status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => adminAPI.reviewRequest(id, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const [filterText, setFilterText] = useState('');

  // adminRequests tiene forma { count, results, pending_count, ... }
  const allRequests = Array.isArray(adminRequests?.results)
    ? adminRequests.results
    : [];

  // Solo mostramos solicitudes NO aprobadas (pending / rejected / otras)
  const rawRequests = allRequests.filter(
    (req) => req.status !== 'approved'
  );

  // Lista filtrada por texto (nombre/email) sobre las NO aprobadas
  const filteredRequests = rawRequests.filter((req) => {
    if (!filterText) return true;
    const term = filterText.toLowerCase();
    const fullName = `${req.first_name || ''} ${req.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(term) ||
      req.email?.toLowerCase().includes(term)
    );
  });

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

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'text-[#19c3e6]',
      bgColor: 'rgba(25, 195, 230, 0.1)',
    },
    {
      title: 'Administradores',
      value: stats?.admin_users || 0,
      icon: UserPlus,
      color: 'text-purple-400',
      bgColor: 'rgba(168, 85, 247, 0.1)',
    },
    {
      title: 'Invitaciones Activas',
      value: stats?.active_invitations || 0,
      icon: Mail,
      color: 'text-cyan-400',
      bgColor: 'rgba(34, 211, 238, 0.1)',
    },
    {
      title: 'Solicitudes Pendientes',
      value: stats?.pending_requests || 0,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'rgba(251, 146, 60, 0.1)',
    }
  ];

  if (isLoadingStats || isLoadingRequests) {
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
        <h1 className="text-4xl md:text-3xl font-black text-[#f5f5f0] tracking-tight">Análisis del Laboratorio</h1>
        <p className="text-[#f5f5f0]/60 text-sm md:text-base mt-2">Panel de control y supervisión del sistema de usuarios</p>
      </motion.div>

      {/* Stat Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? TrendingUp : card.trend === 'down' ? TrendingDown : null;

          return (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="p-6 rounded-xl border border-[#19c3e6]/20 transition-all cursor-pointer"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg" style={{ background: card.bgColor }}>
                  <Icon className={`h-5 w-5 md:h-6 md:w-6 ${card.color}`} />
                </div>
                <div className={`text-xs font-bold flex items-center gap-1 ${
                  card.trend === 'up' ? 'text-emerald-400' : 
                  card.trend === 'down' ? 'text-rose-400' : 
                  'text-slate-400'
                }`}>
                  {TrendIcon && <TrendIcon className="h-3 w-3" />}
                  {card.change}
                </div>
              </div>
              <p className="text-[#f5f5f0]/60 text-xs font-medium uppercase tracking-wider">{card.title}</p>
              <p className="text-3xl md:text-4xl font-black text-[#f5f5f0] mt-2">{card.value}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Pending Requests Table */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-[#19c3e6]/20 overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#19c3e6]/10 flex items-center justify-between flex-col md:flex-row gap-4">
          <div>
            <h4 className="text-[#f5f5f0] font-black">Solicitudes de Acceso Pendientes</h4>
            <p className="text-xs text-[#f5f5f0]/60 mt-1">Investigadores esperando aprobación</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Filtrar investigadores..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-[#19c3e6]/5 border border-[#19c3e6]/20 text-xs rounded-lg px-3 py-2 focus:border-[#19c3e6] focus:outline-none transition-all text-[#f5f5f0] placeholder-[#f5f5f0]/40 flex-1 md:w-48"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-[#f5f5f0]/60 bg-[#0f1513]/30 border-b border-[#19c3e6]/10">
                <th className="px-6 py-4 font-black">Investigador</th>
                <th className="px-6 py-4 font-black hidden md:table-cell">Celular</th>
                <th className="px-6 py-4 font-black hidden lg:table-cell">Institución</th>
                <th className="px-6 py-4 font-black hidden lg:table-cell">Fecha Solicitud</th>
                <th className="px-6 py-4 font-black">Estado</th>
                <th className="px-6 py-4 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#19c3e6]/10">
               {filteredRequests.map((request, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  whileHover={{ backgroundColor: 'rgba(25, 195, 230, 0.05)' }}
                  className="group transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#19c3e6]/20 flex items-center justify-center text-[#19c3e6] font-black text-xs flex-shrink-0">
                        {`${(request.first_name || '').charAt(0)}${(request.last_name || '').charAt(0)}`.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#f5f5f0] truncate">
                          {request.first_name} {request.last_name}
                        </p>
                        <p className="text-[10px] text-[#f5f5f0]/50 font-mono truncate">
                          {request.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-xs text-[#f5f5f0] truncate block">
                      {request.phone || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-xs text-[#f5f5f0]/70 italic truncate block">
                      {request.affiliation || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-xs font-mono text-[#f5f5f0]/60">
                      {request.created_at
                        ? new Date(request.created_at).toLocaleString('es-CO')
                        : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                        request.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : request.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : request.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-[#19c3e6]/20 text-[#19c3e6]'
                      }`}
                    >
                      {request.status_display || request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => approveMutation.mutate(request.id)}
                        disabled={approveMutation.isLoading || request.status === 'approved'}
                        className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-40"
                        title="Aprobar"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => rejectMutation.mutate(request.id)}
                        disabled={rejectMutation.isLoading || request.status === 'rejected'}
                        className="w-8 h-8 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-40"
                        title="Rechazar"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0f1513]/30 border-t border-[#19c3e6]/10 flex items-center justify-between text-[11px] text-[#f5f5f0]/60 flex-col sm:flex-row gap-4">
          <p>
            Mostrando {filteredRequests.length} de {rawRequests.length} solicitudes no aprobadas
          </p>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-2 py-1 rounded border border-[#19c3e6]/20 hover:bg-[#19c3e6]/10 text-[#f5f5f0]/60 hover:text-[#f5f5f0] transition-all disabled:opacity-30"
            >
              Anterior
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-2 py-1 rounded border border-[#19c3e6] text-[#19c3e6] hover:bg-[#19c3e6]/10 transition-all"
            >
              Siguiente
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Footer Status */}
      <motion.footer
        variants={itemVariants}
        className="p-4 rounded-xl border border-[#19c3e6]/10 flex items-center justify-between text-[10px] text-[#f5f5f0]/60 font-mono flex-col sm:flex-row gap-4"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="text-center sm:text-right">© {new Date().getFullYear()} Universidad Nacional de Colombia. Todos los derechos reservados.
</span>
      </motion.footer>
    </motion.div>
  );
};

export default AdminDashboard;