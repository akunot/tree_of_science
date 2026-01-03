import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  MessageSquare
} from 'lucide-react';

const AdminRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const queryClient = useQueryClient();

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: adminAPI.getAdminRequests,
  });

  const reviewRequestMutation = useMutation({
    mutationFn: ({ requestId, action, notes }) => adminAPI.reviewAdminRequest(requestId, action, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-requests']);
      setSelectedRequest(null);
      setReviewNotes('');
    },
  });

  const formatDate = (dateString) => {
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

  const handleReviewRequest = (requestId, action) => {
    reviewRequestMutation.mutate({
      requestId,
      action,
      notes: reviewNotes
    });
  };

  const openReviewModal = (request) => {
    setSelectedRequest(request);
    setReviewNotes('');
  };

  const closeReviewModal = () => {
    setSelectedRequest(null);
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

  const pendingRequests = requests?.filter(req => req.status === 'pending') || [];
  const reviewedRequests = requests?.filter(req => req.status !== 'pending') || [];

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Administrador</h1>
          <p className="text-gray-600">Revisar y gestionar solicitudes de acceso administrativo</p>
        </div>

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
                  <p className="text-2xl font-bold text-gray-900">{requests?.filter(req => req.status === 'approved').length || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{requests?.filter(req => req.status === 'rejected').length || 0}</p>
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
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error al cargar las solicitudes. Intente nuevamente.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-orange-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {request.first_name} {request.last_name}
                          </h3>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              {request.email}
                            </div>
                            {request.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-2" />
                                {request.phone}
                              </div>
                            )}
                            <div className="flex items-center text-sm text-gray-600">
                              <Building className="h-4 w-4 mr-2" />
                              {request.affiliation}
                            </div>
                          </div>
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Justificación:</h4>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                              {request.justification}
                            </p>
                          </div>
                          <div className="mt-2">
                            <span className="text-xs text-gray-400">
                              Solicitada: {formatDate(request.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => openReviewModal(request)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Revisar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingRequests.length === 0 && (
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
              {reviewedRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserPlus className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900">
                              {request.first_name} {request.last_name}
                            </h3>
                            <Badge variant={getStatusBadge(request.status)}>
                              {getStatusText(request.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{request.email}</p>
                          <p className="text-xs text-gray-400">
                            Solicitada: {formatDate(request.created_at)}
                          </p>
                          {request.reviewed_at && (
                            <p className="text-xs text-gray-400">
                              Revisada: {formatDate(request.reviewed_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {reviewedRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay solicitudes revisadas</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de revisión */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeReviewModal}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Revisar Solicitud de Administrador
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700">Solicitante:</h4>
                      <p className="text-sm text-gray-600">
                        {selectedRequest.first_name} {selectedRequest.last_name} ({selectedRequest.email})
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700">Afiliación:</h4>
                      <p className="text-sm text-gray-600">{selectedRequest.affiliation}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700">Justificación:</h4>
                      <div className="mt-1 p-3 bg-gray-50 rounded border text-sm text-gray-600">
                        {selectedRequest.justification}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="review_notes">Notas de revisión (opcional)</Label>
                      <textarea
                        id="review_notes"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        rows="3"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Agregue notas sobre su decisión..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    className="w-full sm:w-auto sm:ml-3 bg-green-600 hover:bg-green-700"
                    onClick={() => handleReviewRequest(selectedRequest.id, 'approve')}
                    disabled={reviewRequestMutation.isPending}
                  >
                    {reviewRequestMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </div>
                    )}
                  </Button>
                  
                  <Button
                    className="mt-3 w-full sm:mt-0 sm:w-auto bg-red-600 hover:bg-red-700"
                    onClick={() => handleReviewRequest(selectedRequest.id, 'reject')}
                    disabled={reviewRequestMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                  
                  <Button
                    className="mt-3 w-full sm:mt-0 sm:w-auto sm:ml-3"
                    variant="outline"
                    onClick={closeReviewModal}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRequests;