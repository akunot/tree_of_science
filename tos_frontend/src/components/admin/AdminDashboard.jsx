import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Clock,
  Settings
} from 'lucide-react';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminAPI.getStats,
  });

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

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats?.total_users || 0,
      description: 'Usuarios registrados en el sistema',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Administradores',
      value: stats?.admin_users || 0,
      description: 'Usuarios con permisos administrativos',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Invitaciones Activas',
      value: stats?.active_invitations || 0,
      description: 'Invitaciones pendientes de uso',
      icon: Mail,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Solicitudes Pendientes',
      value: stats?.pending_requests || 0,
      description: 'Solicitudes de admin por revisar',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Panel de control del sistema</p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-2 ${card.bgColor} rounded-lg`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sección principal: solo acciones rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Tareas administrativas comunes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" asChild>
                <Link to="/admin/users">
                  <Users className="h-4 w-4 mr-3" />
                  Gestionar Usuarios
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/invitations">
                  <UserPlus className="h-4 w-4 mr-3" />
                  Crear Invitación
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/requests">
                  <Mail className="h-4 w-4 mr-3" />
                  Revisar Solicitudes
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/settings">
                  <Settings className="h-4 w-4 mr-3" />
                  Configuraciones
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de usuarios por estado */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Usuarios por Estado</CardTitle>
              <CardDescription>
                Distribución actual de usuarios en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats?.users_by_status || {}).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <Badge variant={getStatusBadge(status)} className="mt-1">
                      {getStatusText(status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;