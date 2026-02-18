import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import {
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Mail,
  Phone,
  AlertCircle,
  Eye,
  X,
  Filter,
  Search,
} from 'lucide-react';

const AdminRequests = () => {
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      if (!adminAPI.getAdminRequests) {
        return [
          {
            id: 1,
            first_name: 'Elena',
            last_name: 'Martinez',
            email: 'e.martinez@mit.edu',
            phone: '+1 (555) 123-4567',
            affiliation: 'MIT - Quantum Lab',
            justification: 'Requires access to manage node hierarchy for the upcoming global climate simulation project. Needs to oversee 40+ researchers.',
            status: 'pending',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            first_name: 'Julian',
            last_name: 'Sterling',
            email: 'j.sterling@cern.ch',
            phone: '+41 (22) 767-6111',
            affiliation: 'CERN Particle Group',
            justification: 'Applying for departmental admin rights to facilitate cross-institutional data sharing between LHC nodes.',
            status: 'pending',
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            first_name: 'Sarah',
            last_name: 'Yoon',
            email: 'yoon.s@stanford.edu',
            phone: '+1 (650) 721-3000',
            affiliation: 'Stanford Genetics',
            justification: 'I need to approve new lab technicians and manage sensitive dataset permissions for the CRISPR project.',
            status: 'approved',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            review_notes: 'Verificada institución y justificación válida',
          },
          {
            id: 4,
            first_name: 'David',
            last_name: 'Rossi',
            email: 'rossi.d@oxford.ac.uk',
            phone: '+44 (1865) 270-000',
            affiliation: 'Oxford Archaeology',
            justification: 'Establishing a new digital archive node. I am the lead investigator and need to structure the archival database.',
            status: 'rejected',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            review_notes: 'Falta verificación de institución',
          },
        ];
      }
      return await adminAPI.getAdminRequests();
    },
  });

  const reviewRequestMutation = useMutation({
    mutationFn: ({ requestId, status, review_notes }) =>
      adminAPI.reviewRequest?.(requestId, { status, review_notes }) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      setSelectedRequestId(null);
      setReviewNotes('');
    },
    onError: (error) => {
      console.error('Error reviewing request:', error);
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;

    return formatDate(dateString);
  };

  const handleReviewRequest = (requestId, status) => {
    reviewRequestMutation.mutate({
      requestId,
      status,
      review_notes: reviewNotes.trim(),
    });
  };

  const openReviewModal = (requestId) => {
    setSelectedRequestId(requestId);
    setReviewNotes('');
  };

  const closeReviewModal = () => {
    setSelectedRequestId(null);
    setReviewNotes('');
  };

  const allRequests = Array.isArray(requestsData?.results)
    ? requestsData.results
    : Array.isArray(requestsData)
    ? requestsData
    : [];

  const pendingRequests = allRequests.filter((req) => req.status === 'pending');
  const reviewedRequests = allRequests.filter((req) => req.status !== 'pending');
  const approvedRequests = allRequests.filter((req) => req.status === 'approved');
  const rejectedRequests = allRequests.filter((req) => req.status === 'rejected');

  const selectedRequest = allRequests.find((req) => req.id === selectedRequestId);

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
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-4xl md:text-3xl font-black text-[#f5f5f0] tracking-tight">
          Solicitudes de Administrador
        </h1>
        <p className="text-[#f5f5f0]/60 text-sm md:text-base mt-2">
          Revisar y gestionar solicitudes de acceso administrativo
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { title: 'Pendientes', count: pendingRequests.length, icon: Clock, color: 'text-amber-400', bg: 'rgba(251, 146, 60, 0.1)' },
          { title: 'Aprobadas', count: approvedRequests.length, icon: CheckCircle, color: 'text-emerald-400', bg: 'rgba(16, 185, 129, 0.1)' },
          { title: 'Rechazadas', count: rejectedRequests.length, icon: XCircle, color: 'text-rose-400', bg: 'rgba(244, 63, 94, 0.1)' },
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

      {/* Pending Requests */}
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
            <h2 className="text-lg font-black text-[#f5f5f0] flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Solicitudes Pendientes ({pendingRequests.length})
            </h2>
            <p className="text-xs text-[#f5f5f0]/60 mt-1">Solicitudes que requieren revisión</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f5f5f0]/40" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="w-full bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#19c3e6] focus:outline-none transition-all text-[#f5f5f0] placeholder-[#f5f5f0]/40 md:w-64"
              />
            </div>
          </div>
        </div>

        {/* Pending List */}
        <div className="p-6 space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request, idx) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-lg border border-amber-500/30 hover:border-amber-500/50 transition-all hover:bg-amber-500/5 group"
              >
                <div className="flex items-start gap-4 justify-between flex-col sm:flex-row">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-black text-xs flex-shrink-0">
                        {request.first_name.charAt(0)}{request.last_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#f5f5f0] truncate">
                          {request.first_name} {request.last_name}
                        </h3>
                        <p className="text-xs text-[#f5f5f0]/60 truncate">{request.email}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      {request.affiliation && (
                        <div className="flex items-center gap-2 text-xs text-[#f5f5f0]/70">
                          <Building className="h-3 w-3 flex-shrink-0" />
                          <span>{request.affiliation}</span>
                        </div>
                      )}
                      {request.phone && (
                        <div className="flex items-center gap-2 text-xs text-[#f5f5f0]/70">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>{request.phone}</span>
                        </div>
                      )}
                      {request.justification && (
                        <div className="mt-2 p-3 bg-[#0f1513]/50 border border-[#19c3e6]/10 rounded text-xs text-[#f5f5f0]/70 line-clamp-2">
                          {request.justification}
                        </div>
                      )}
                      <p className="text-[10px] text-[#f5f5f0]/50">
                        Solicitada: {formatRelativeTime(request.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openReviewModal(request.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold text-sm rounded-lg transition-all uppercase tracking-widest flex-shrink-0"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Revisar</span>
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div variants={itemVariants} className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto mb-4 text-[#f5f5f0]/20" />
              <p className="text-[#f5f5f0]/60 font-bold">No hay solicitudes pendientes</p>
              <p className="text-[#f5f5f0]/40 text-sm mt-1">Las nuevas solicitudes aparecerán aquí</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Reviewed Requests */}
      {reviewedRequests.length > 0 && (
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
              <h2 className="text-lg font-black text-[#f5f5f0]">
                Solicitudes Revisadas ({reviewedRequests.length})
              </h2>
              <p className="text-xs text-[#f5f5f0]/60 mt-1">Historial de solicitudes procesadas</p>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#19c3e6]/5 border border-[#19c3e6]/20 rounded-lg px-3 py-2 text-sm text-[#f5f5f0] focus:border-[#19c3e6] focus:outline-none transition-all appearance-none font-bold"
            >
              <option value="all" className="bg-[#0f1513]">Todas</option>
              <option value="approved" className="bg-[#0f1513]">Aprobadas</option>
              <option value="rejected" className="bg-[#0f1513]">Rechazadas</option>
            </select>
          </div>

          {/* List */}
          <div className="p-6 space-y-4">
            {reviewedRequests
              .filter((req) =>
                statusFilter === 'all'
                  ? true
                  : statusFilter === 'approved'
                  ? req.status === 'approved'
                  : req.status === 'rejected'
              )
              .map((request, idx) => {
                const isApproved = request.status === 'approved';
                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-lg border transition-all ${
                      isApproved
                        ? 'border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                        : 'border-rose-500/30 hover:border-rose-500/50 hover:bg-rose-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-4 justify-between flex-col sm:flex-row">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                              isApproved
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {request.first_name.charAt(0)}{request.last_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[#f5f5f0] truncate">
                              {request.first_name} {request.last_name}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs text-[#f5f5f0]/60 truncate">{request.email}</p>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  isApproved
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                }`}
                              >
                                {isApproved ? 'Aprobada' : 'Rechazada'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        {request.review_notes && (
                          <div className="mt-3 p-3 bg-[#0f1513]/50 border border-[#19c3e6]/10 rounded text-xs text-[#f5f5f0]/70">
                            <span className="font-bold text-[#19c3e6]">Notas:</span> {request.review_notes}
                          </div>
                        )}
                        <p className="text-[10px] text-[#f5f5f0]/50 mt-2">
                          Revisada:{' '}
                          {request.time_since_reviewed ||
                            request.time_since_created ||
                            formatRelativeTime(request.reviewed_at || request.created_at)}
                        </p>
                      </div>

                      {/* Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openReviewModal(request.id)}
                        className="flex items-center gap-2 px-4 py-2 border border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10 text-[#f5f5f0] font-bold text-sm rounded-lg transition-all flex-shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Ver</span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeReviewModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f1513] border border-[#19c3e6]/20 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            style={{
              background: 'rgba(15, 21, 19, 0.95)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#19c3e6]/10">
              <h3 className="text-lg font-black text-[#f5f5f0]">Revisar Solicitud</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeReviewModal}
                className="p-1 hover:bg-[#19c3e6]/10 rounded-lg text-[#19c3e6] transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Solicitante */}
              <div>
                <h4 className="text-xs font-black text-[#f5f5f0]/70 uppercase tracking-wider mb-2">Solicitante</h4>
                <p className="text-sm font-bold text-[#f5f5f0]">
                  {selectedRequest.first_name} {selectedRequest.last_name}
                </p>
                <p className="text-sm text-[#f5f5f0]/60">{selectedRequest.email}</p>
              </div>

              {/* Teléfono */}
              {selectedRequest.phone && (
                <div>
                  <h4 className="text-xs font-black text-[#f5f5f0]/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    Teléfono
                  </h4>
                  <p className="text-sm text-[#f5f5f0]/60">{selectedRequest.phone}</p>
                </div>
              )}

              {/* Afiliación */}
              {selectedRequest.affiliation && (
                <div>
                  <h4 className="text-xs font-black text-[#f5f5f0]/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    Afiliación
                  </h4>
                  <p className="text-sm text-[#f5f5f0]/60">{selectedRequest.affiliation}</p>
                </div>
              )}

              {/* Justificación */}
              {selectedRequest.justification && (
                <div>
                  <h4 className="text-xs font-black text-[#f5f5f0]/70 uppercase tracking-wider mb-2">Justificación</h4>
                  <div className="p-3 bg-[#0f1513]/50 border border-[#19c3e6]/10 rounded text-sm text-[#f5f5f0]/70">
                    {selectedRequest.justification}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-[#19c3e6]/10 bg-[#0f1513]/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={closeReviewModal}
                disabled={reviewRequestMutation.isPending}
                className="flex-1 px-4 py-2.5 border border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10 text-[#f5f5f0] font-bold text-sm rounded-lg transition-all disabled:opacity-50"
              >
                Cerrar
              </motion.button>

              {selectedRequest.status === 'pending' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReviewRequest(selectedRequest.id, 'rejected')}
                    disabled={reviewRequestMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-black text-sm rounded-lg transition-all disabled:opacity-50 uppercase tracking-widest"
                  >
                    <XCircle className="h-4 w-4" />
                    {reviewRequestMutation.isPending ? 'Procesando...' : 'Rechazar'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReviewRequest(selectedRequest.id, 'approved')}
                    disabled={reviewRequestMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-black text-sm rounded-lg transition-all disabled:opacity-50 uppercase tracking-widest"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {reviewRequestMutation.isPending ? 'Procesando...' : 'Aprobar'}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminRequests;