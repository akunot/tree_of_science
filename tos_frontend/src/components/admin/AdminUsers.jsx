import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Clock
} from 'lucide-react';

const UserCard = ({
  user,
  editingUserId,
  userToEdit,
  editError,
  updateUserMutation,
  getStatusBadge,
  getStatusText,
  getRoleBadge,
  getRoleText,
  formatDate,
  handleEditUser,
  handleSaveUser,
  handleCancelEdit,
  updateEditField,
}) => (
  <div className="border rounded-lg p-4">
    {editingUserId === user.id && editError && (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{editError}</AlertDescription>
      </Alert>
    )}

    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1">
            {editingUserId === user.id && userToEdit ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input
                  value={userToEdit.first_name}
                  onChange={(e) => updateEditField('first_name', e.target.value)}
                  placeholder="Nombre"
                  disabled={updateUserMutation.isPending}
                />
                <Input
                  value={userToEdit.last_name}
                  onChange={(e) => updateEditField('last_name', e.target.value)}
                  placeholder="Apellido"
                  disabled={updateUserMutation.isPending}
                />
              </div>
            ) : (
              <>
                <h3 className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </>
            )}
            <div className="flex items-center space-x-2 mt-2 flex-wrap gap-2">
              <Badge variant={getStatusBadge(user.user_state)}>
                {getStatusText(user.user_state)}
              </Badge>
              <Badge variant={getRoleBadge(user.is_staff ? 'administrator' : 'user')}>
                {getRoleText(user.is_staff ? 'administrator' : 'user')}
              </Badge>
              <span className="text-xs text-gray-400">
                {formatDate(user.date_joined)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 ml-4">
        {editingUserId === user.id && userToEdit ? (
          <>
            <div className="grid grid-cols-1 gap-2">
              <Select
                value={userToEdit.user_state}
                onValueChange={(value) => updateEditField('user_state', value)}
                disabled={updateUserMutation.isPending}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={userToEdit.role}
                onValueChange={(value) => updateEditField('role', value)}
                disabled={updateUserMutation.isPending}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="administrator">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-1">
              <Button
                size="sm"
                onClick={handleSaveUser}
                disabled={updateUserMutation.isPending}
                className="flex-1"
              >
                {updateUserMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateUserMutation.isPending}
                className="flex-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditUser(user)}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        )}
      </div>
    </div>
  </div>
);

const AdminUsers = () => {
  // ===== ESTADO =====
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
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
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['admin-users', debouncedSearch, roleFilter],
    queryFn: () => {
      const params = { search: debouncedSearch || undefined };
      if (roleFilter !== 'all') params.role = roleFilter;
      return adminAPI.getUsers(params);
    },
  });

  const { data: invitationsData, isLoading: invitationsLoading, error: invitationsError } = useQuery({
    queryKey: ['admin-invitations'],
    queryFn: adminAPI.getInvitations,
  });

  const users = usersData?.users || [];
  
  // ✅ PROCESAMIENTO DE INVITACIONES
  const allInvitations = invitationsData?.invitations || (Array.isArray(invitationsData) ? invitationsData : []);
  
  // Separar por estado
  const pendingInvitations = allInvitations.filter(inv => inv.state === 'PENDING');
  const usedInvitations = allInvitations.filter(inv => inv.state === 'ACCEPTED');

  // ===== MUTATIONS =====
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => adminAPI.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setEditingUserId(null);
      setUserToEdit(null);
      setEditError(null);
    },
    onError: (error) => {
      setEditError(error.message || 'Error al actualizar el usuario');
    }
  });

  const revokeInvitationMutation = useMutation({
    mutationFn: adminAPI.revokeInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-invitations']);
    },
  });

  // ===== FUNCIONES AUXILIARES =====
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: 'success',
      PENDING: 'warning',
      SUSPENDED: 'destructive',
      INVITED: 'default'
    };
    return variants[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      ACTIVE: 'Activo',
      PENDING: 'Pendiente',
      SUSPENDED: 'Suspendido',
      INVITED: 'Invitado'
    };
    return texts[status] || status;
  };

  const getRoleBadge = (role) => {
    return role === 'administrator' ? 'default' : 'secondary';
  };

  const getRoleText = (role) => {
    return role === 'administrator' ? 'Administrador' : 'Usuario';
  };

  const getInvitationStatusBadge = (invitation) => {
    if (invitation.is_used || invitation.state === 'ACCEPTED') {
      return { variant: 'success', text: 'Usada' };
    }
    
    if (invitation.is_expired || (invitation.expires_at && new Date(invitation.expires_at) < new Date())) {
      return { variant: 'destructive', text: 'Expirada' };
    }
    
    return { variant: 'default', text: 'Activa' };
  };

  const getInviteUrl = (token) => {
    return `${window.location.origin}/register?token=${token}`;
  };

  // ===== HANDLERS USUARIOS =====
  const handleEditUser = (user) => {
    setUserToEdit({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      user_state: user.user_state,
      role: user.is_staff ? 'administrator' : 'user'
    });
    setEditingUserId(user.id);
    setEditError(null);
  };

  const validateEdit = () => {
    if (!userToEdit.first_name?.trim()) {
      setEditError('El nombre es requerido');
      return false;
    }
    if (!userToEdit.last_name?.trim()) {
      setEditError('El apellido es requerido');
      return false;
    }
    return true;
  };

  const handleSaveUser = () => {
    if (!validateEdit()) return;

    updateUserMutation.mutate({
      userId: userToEdit.id,
      data: {
        user_state: userToEdit.user_state,
        is_staff: userToEdit.role === 'administrator',
        first_name: userToEdit.first_name.trim(),
        last_name: userToEdit.last_name.trim()
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setUserToEdit(null);
    setEditError(null);
  };

  const updateEditField = (field, value) => {
    setUserToEdit(prev => ({
      ...prev,
      [field]: value
    }));
    setEditError(null);
  };

  // ===== HANDLERS INVITACIONES =====
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

  // ===== RENDER INVITATION CARD =====
  const renderInvitationCard = (invitation) => {
    const statusBadge = getInvitationStatusBadge(invitation);
    return (
      <div key={invitation.id} className="border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {invitation.first_name} {invitation.last_name}
                </h3>
                <p className="text-sm text-gray-500">{invitation.email}</p>
                <div className="flex items-center space-x-2 mt-1 flex-wrap gap-2">
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

          <div className="flex items-center space-x-2 ml-4">
            {!invitation.is_used && invitation.state === 'PENDING' && (
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

        {/* Detalles */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Enlace:</span>
              <a 
                href={getInviteUrl(invitation.token)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:underline text-xs break-all"
              >
                {getInviteUrl(invitation.token)}
              </a>
            </div>
            {invitation.used_by && (
              <div>
                <span className="font-medium text-gray-700">Aceptada por:</span>
                <span className="ml-2 text-sm">{invitation.used_by.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ===== LOADING =====
  if (usersLoading || invitationsLoading) {
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios e Invitaciones</h1>
          <p className="text-gray-600">Administrar usuarios registrados e invitaciones pendientes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{users.length}</div>
                <p className="text-sm text-gray-600">Usuarios Registrados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{pendingInvitations.length}</div>
                <p className="text-sm text-gray-600">Invitaciones Pendientes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{usedInvitations.length}</div>
                <p className="text-sm text-gray-600">Invitaciones Aceptadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios ({users.length})
            </TabsTrigger>
            <TabsTrigger value="pending-invitations" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendientes ({pendingInvitations.length})
            </TabsTrigger>
            <TabsTrigger value="accepted-invitations" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aceptadas ({usedInvitations.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB: PENDIENTES */}
          <TabsContent value="pending-invitations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Invitaciones Pendientes
                </CardTitle>
                <CardDescription>
                  Invitaciones que aún no han sido aceptadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invitationsError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Error al cargar invitaciones: {invitationsError.message || 'Intente nuevamente más tarde.'}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  {pendingInvitations.length > 0 ? (
                    pendingInvitations.map(inv => renderInvitationCard(inv))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay invitaciones pendientes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: USUARIOS */}
          <TabsContent value="users" className="space-y-6">
            {/* ✅ CAMBIO: Filtros simplificados (solo Búsqueda y Rol) */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="administrator">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSearchTerm('');
                        setRoleFilter('all');
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Limpiar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios Registrados</CardTitle>
              </CardHeader>
              <CardContent>
                {usersError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Error al cargar usuarios: {usersError.message || 'Intente nuevamente más tarde.'}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        editingUserId={editingUserId}
                        userToEdit={userToEdit}
                        editError={editError}
                        updateUserMutation={updateUserMutation}
                        getStatusBadge={getStatusBadge}
                        getStatusText={getStatusText}
                        getRoleBadge={getRoleBadge}
                        getRoleText={getRoleText}
                        formatDate={formatDate}
                        handleEditUser={handleEditUser}
                        handleSaveUser={handleSaveUser}
                        handleCancelEdit={handleCancelEdit}
                        updateEditField={updateEditField}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay usuarios</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: ACEPTADAS */}
          <TabsContent value="accepted-invitations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Invitaciones Aceptadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usedInvitations.length > 0 ? (
                    usedInvitations.map(inv => renderInvitationCard(inv))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay invitaciones aceptadas</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;