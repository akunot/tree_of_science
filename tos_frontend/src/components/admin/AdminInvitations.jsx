import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Clock
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

  const queryClient = useQueryClient();

  const { data: invitations, isLoading, error } = useQuery({
    queryKey: ['admin-invitations'],
    queryFn: adminAPI.getInvitations,
  });

  const createInvitationMutation = useMutation({
    mutationFn: adminAPI.createInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-invitations']);
      setShowCreateForm(false);
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'user',
      });
      alert('Invitación creada correctamente.');
    },
    onError: (error) => {
      alert(
        error?.response?.data?.detail ||
          'Error al crear la invitación. Verifique los datos e intente nuevamente.'
      );
    },
  });

  const revokeInvitationMutation = useMutation({
    mutationFn: adminAPI.revokeInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-invitations']);
    },
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getStatusBadge = (invitation) => {
    if (invitation.is_used) {
      return { variant: 'success', text: 'Usada' };
    }
    
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return { variant: 'destructive', text: 'Expirada' };
    }
    
    return { variant: 'default', text: 'Activa' };
  };

  const handleCreateInvitation = (e) => {
    e.preventDefault();
    const email = formData.email.trim();
    if (!email.includes('@')) {
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

  const handleCopyLink = (inviteUrl) => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(inviteUrl);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getInviteUrl = (token) => {
    return `${window.location.origin}/register?token=${token}`;
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

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Invitaciones</h1>
            <p className="text-gray-600">Crear y administrar invitaciones del sistema</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Invitación
          </Button>
        </div>

        {/* Formulario de crear invitación */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Crear Nueva Invitación</CardTitle>
              <CardDescription>
                Complete el formulario para generar una nueva invitación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateInvitation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      placeholder="Juan"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      placeholder="Pérez"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="correo@unal.edu.co"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="administrator">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={createInvitationMutation.isPending}>
                    {createInvitationMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creando...
                      </div>
                    ) : (
                      'Crear Invitación'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de invitaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Invitaciones ({invitations?.length || 0})
            </CardTitle>
            <CardDescription>
              Lista de todas las invitaciones creadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error al cargar las invitaciones. Intente nuevamente.
                </AlertDescription>
              </Alert>
            )}

            {/* Filtros simples */}
            {invitations?.length > 0 && (
              <div className="flex items-center justify-end mb-4 gap-2">
                <Label htmlFor="status" className="text-xs text-gray-500">
                  Estado
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="used">Usadas</SelectItem>
                    <SelectItem value="expired">Expiradas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-4">
              {invitations
                ?.filter((invitation) => {
                  if (statusFilter === 'all') return true;
                  if (statusFilter === 'used') return invitation.is_used;
                  const isExpired =
                    invitation.expires_at &&
                    new Date(invitation.expires_at) < new Date();
                  if (statusFilter === 'expired') return isExpired;
                  if (statusFilter === 'active') return !invitation.is_used && !isExpired;
                  return true;
                }).map((invitation) => {
                const statusBadge = getStatusBadge(invitation);
                return (
                  <div key={invitation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {invitation.first_name} {invitation.last_name}
                            </h3>
                            <p className="text-sm text-gray-500">{invitation.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={statusBadge.variant}>
                                {statusBadge.text}
                              </Badge>
                              <Badge variant={invitation.role === 'administrator' ? 'default' : 'secondary'}>
                                {invitation.role === 'administrator' ? 'Administrador' : 'Usuario'}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                Creada: {formatRelativeDate(invitation.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!invitation.is_used && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyToken(invitation.token)}
                              title="Copiar token"
                            >
                              {copiedToken === invitation.token ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyLink(getInviteUrl(invitation.token))}
                              title="Copiar enlace"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (window.confirm('¿Está seguro de revocar esta invitación?')) {
                                  revokeInvitationMutation.mutate(invitation.id);
                                }
                              }}
                              disabled={revokeInvitationMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Detalles expandibles */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Token:</span>
                          <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                            {invitation.token}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Enlace:</span>
                          <a 
                            href={getInviteUrl(invitation.token)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:underline text-xs"
                          >
                            {getInviteUrl(invitation.token)}
                          </a>
                        </div>
                        {invitation.is_used && (
                          <div>
                            <span className="font-medium text-gray-700">Usada por:</span>
                            <span className="ml-2 text-sm">{invitation.used_by?.email}</span>
                          </div>
                        )}
                        {invitation.expires_at && (
                          <div>
                            <span className="font-medium text-gray-700">Expira:</span>
                            <span className="ml-2 text-sm">
                              {new Date(invitation.expires_at) < new Date() ? (
                                <span className="text-red-600">Expirada</span>
                              ) : (
                                formatRelativeDate(invitation.expires_at)
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {(!invitations || invitations.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay invitaciones creadas</p>
                  <p className="text-sm">Haz clic en "Nueva Invitación" para crear la primera</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminInvitations;