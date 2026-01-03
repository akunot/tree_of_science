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
  Search, 
  Filter, 
  Edit, 
  UserCheck, 
  UserX, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);

  const queryClient = useQueryClient();

  const { data: usersData, isLoading, error } = useQuery({ // Cambiamos 'data: users' a 'data: usersData'
    queryKey: ['admin-users', searchTerm, statusFilter, roleFilter],
    queryFn: () => adminAPI.getUsers({ search: searchTerm, status: statusFilter, role: roleFilter }),
  });

  const users = Array.isArray(usersData) ? usersData : usersData?.results || [];  

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => adminAPI.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setEditingUser(null);
      setUserToEdit(null);
    },
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setEditingUser(true);
  };

  const handleSaveUser = () => {
    if (userToEdit) {
      updateUserMutation.mutate({
        userId: userToEdit.id,
        data: {
          status: userToEdit.status,
          role: userToEdit.role,
          first_name: userToEdit.first_name,
          last_name: userToEdit.last_name
        }
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setUserToEdit(null);
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administrar usuarios del sistema</p>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar usuarios</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                    <SelectItem value="INVITED">Invitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="role">Rol</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
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
                    setStatusFilter('all');
                    setRoleFilter('all');
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Usuarios ({users.length})
            </CardTitle>
            <CardDescription>
              Lista completa de usuarios registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error al cargar los usuarios. Intente nuevamente.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {users?.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          {editingUser && userToEdit?.id === user.id ? (
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                value={userToEdit.first_name}
                                onChange={(e) => setUserToEdit({...userToEdit, first_name: e.target.value})}
                                placeholder="Nombre"
                              />
                              <Input
                                value={userToEdit.last_name}
                                onChange={(e) => setUserToEdit({...userToEdit, last_name: e.target.value})}
                                placeholder="Apellido"
                              />
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </h3>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={getStatusBadge(user.status)}>
                              {getStatusText(user.status)}
                            </Badge>
                            <Badge variant={getRoleBadge(user.role)}>
                              {getRoleText(user.role)}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              Registrado: {formatDate(user.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {editingUser && userToEdit?.id === user.id ? (
                        <>
                          <Select
                            value={userToEdit.status}
                            onValueChange={(value) => setUserToEdit({...userToEdit, status: value})}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Activo</SelectItem>
                              <SelectItem value="PENDING">Pendiente</SelectItem>
                              <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                              <SelectItem value="INVITED">Invitado</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={userToEdit.role}
                            onValueChange={(value) => setUserToEdit({...userToEdit, role: value})}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuario</SelectItem>
                              <SelectItem value="administrator">Administrador</SelectItem>
                            </SelectContent>
                          </Select>

                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              onClick={handleSaveUser}
                              disabled={updateUserMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {(!users || users.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No se encontraron usuarios</p>
                  <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;