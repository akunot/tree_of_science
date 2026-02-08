import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
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
} from 'lucide-react';

const AdminRequests = () => {
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const queryClient = useQueryClient();

  const { data: requestsData, isLoading, error } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: () => adminAPI.getAdminRequests(),
    staleTime: 1000 * 60 * 5,
  });

  const reviewRequestMutation = useMutation({
    mutationFn: ({ requestId, status, review_notes }) => 
      adminAPI.reviewRequest(requestId, { status, review_notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      setSelectedRequestId(null);
      setReviewNotes('');
      alert('✅ Solicitud procesada correctamente');
    },
    onError: (error) => {
      console.error('❌ Error al revisar solicitud:', error);
      alert('❌ Error al procesar la solicitud. Intente nuevamente.');
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'destructive'
    };
    return variants[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada'
    };
    return texts[status] || status;
  };

  const handleReviewRequest = (requestId, status) => {
    if (!reviewNotes.trim() && !window.confirm('No ha ingresado notas de revisión. ¿Desea continuar sin notas?')) {
          return;
    }
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Manejar datos de respuesta
  const allRequests = Array.isArray(requestsData?.results) 
    ? requestsData.results 
    : Array.isArray(requestsData) 
      ? requestsData 
      : [];

  const pendingRequests = allRequests.filter(req => req.status === 'pending');
  const reviewedRequests = allRequests.filter(req => req.status !== 'pending');

  // Obtener la solicitud seleccionada para el modal
  const selectedRequest = allRequests.find(req => req.id === selectedRequestId);


  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Administrador</h1>
          <p className="text-gray-600">Revisar y gestionar solicitudes de acceso administrativo</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar las solicitudes: {error.message || 'Intente nuevamente'}
            </AlertDescription>
          </Alert>
        )}

        {/* Resumen de solicitudes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allRequests.filter(req => req.status === 'approved').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rechazadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allRequests.filter(req => req.status === 'rejected').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solicitudes pendientes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Solicitudes Pendientes ({pendingRequests.length})
            </CardTitle>
            <CardDescription>
              Solicitudes que requieren revisión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-orange-50 border-orange-200 hover:bg-orange-100 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                              <UserPlus className="h-6 w-6 text-orange-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900">
                              {request.first_name} {request.last_name}
                            </h3>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{request.email}</span>
                              </div>
                              {request.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                                  {request.phone}
                                </div>
                              )}
                              {request.affiliation && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                                  {request.affiliation}
                                </div>
                              )}
                            </div>
                            {request.justification && (
                              <div className="mt-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Justificación:</h4>
                                <p className="text-sm text-gray-600 bg-white p-3 rounded border line-clamp-3">
                                  {request.justification}
                                </p>
                              </div>
                            )}
                            <div className="mt-2">
                              <span className="text-xs text-gray-400">
                                Solicitada: {formatDate(request.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => openReviewModal(request.id)}
                          className="whitespace-nowrap"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Revisar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay solicitudes pendientes</p>
                  <p className="text-sm">Las nuevas solicitudes aparecerán aquí</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Solicitudes revisadas */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Revisadas</CardTitle>
            <CardDescription>
              Historial de solicitudes procesadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviewedRequests.length > 0 ? (
                reviewedRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <UserPlus className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-gray-900">
                                {request.first_name} {request.last_name}
                              </h3>
                              <Badge variant={getStatusBadge(request.status)}>
                                {getStatusText(request.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{request.email}</p>
                            <p className="text-xs text-gray-400">
                              Solicitada: {formatDate(request.created_at)}
                            </p>
                            {request.updated_at && (
                              <p className="text-xs text-gray-400">
                                Revisada: {formatDate(request.updated_at)}
                              </p>
                            )}
                            {request.review_notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                <strong>Notas:</strong> {request.review_notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReviewModal(request.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver detalle
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay solicitudes revisadas</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de revisión - CORREGIDO */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Revisar Solicitud de Administrador
                </h3>
                <button
                  onClick={closeReviewModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                  disabled={reviewRequestMutation.isPending}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Información del solicitante */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Solicitante</h4>
                  <p className="text-sm text-gray-600 font-medium">
                    {selectedRequest.first_name} {selectedRequest.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedRequest.email}</p>
                </div>

                {/* Teléfono */}
                {selectedRequest.phone && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </h4>
                    <p className="text-sm text-gray-600">{selectedRequest.phone}</p>
                  </div>
                )}

                {/* Afiliación */}
                {selectedRequest.affiliation && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Afiliación
                    </h4>
                    <p className="text-sm text-gray-600">{selectedRequest.affiliation}</p>
                  </div>
                )}

                {/* Justificación */}
                {selectedRequest.justification && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Justificación</h4>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-600 whitespace-pre-wrap">
                      {selectedRequest.justification}
                    </div>
                  </div>
                )}

                {/* Notas de revisión */}
                <div>
                  <Label htmlFor="review_notes" className="text-gray-900 font-semibold mb-2 block">
                    Notas de revisión (opcional)
                  </Label>
                  <textarea
                    id="review_notes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Agregue notas sobre su decisión..."
                    disabled={reviewRequestMutation.isPending}
                  />
                </div>
              </div>

              {/* Footer del modal */}
              <div className="flex gap-2 p-6 border-t bg-gray-50">
                <Button
                  variant="outline"
                  onClick={closeReviewModal}
                  disabled={reviewRequestMutation.isPending}
                  className="flex-1"
                >
                  Cerrar
                </Button>

                {/* Solo permitir aprobar/rechazar si está pendiente */}
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleReviewRequest(selectedRequest.id, 'rejected')}
                      disabled={reviewRequestMutation.isPending}
                    >
                      {reviewRequestMutation.isPending ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Procesando...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <XCircle className="h-4 w-4 mr-2" />
                          Rechazar
                        </div>
                      )}
                    </Button>

                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleReviewRequest(selectedRequest.id, 'approved')}
                      disabled={reviewRequestMutation.isPending}
                    >
                      {reviewRequestMutation.isPending ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Procesando...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprobar
                        </div>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRequests;