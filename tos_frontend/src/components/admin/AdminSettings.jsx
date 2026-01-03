import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import { 
  Settings, 
  Shield, 
  Database, 
  Bell, 
  Mail, 
  Save,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    system_name: 'Árbol de la Ciencia',
    institution_name: 'Universidad Nacional de Colombia',
    allow_registration: false,
    admin_approval_required: true,
    invitation_expiry_days: 30,
    max_invitations_per_admin: 10,
    email_notifications: true,
    system_maintenance: false
  });

  const [saved, setSaved] = useState(false);

  const queryClient = useQueryClient();

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminAPI.getSystemSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: adminAPI.updateSystemSettings,
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  React.useEffect(() => {
    if (systemSettings) {
      setSettings(systemSettings);
    }
  }, [systemSettings]);

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
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
            <h1 className="text-2xl font-bold text-gray-900">Configuraciones del Sistema</h1>
            <p className="text-gray-600">Administrar configuraciones globales del sistema</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries(['admin-settings'])}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={handleSaveSettings} disabled={updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Notificación de guardado */}
        {saved && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Configuraciones guardadas exitosamente
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuraciones Generales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuraciones Generales
              </CardTitle>
              <CardDescription>
                Configuraciones básicas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="system_name">Nombre del Sistema</Label>
                <Input
                  id="system_name"
                  value={settings.system_name}
                  onChange={(e) => handleSettingChange('system_name', e.target.value)}
                  placeholder="Árbol de la Ciencia"
                />
              </div>

              <div>
                <Label htmlFor="institution_name">Nombre de la Institución</Label>
                <Input
                  id="institution_name"
                  value={settings.institution_name}
                  onChange={(e) => handleSettingChange('institution_name', e.target.value)}
                  placeholder="Universidad Nacional de Colombia"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow_registration">Permitir Registro Libre</Label>
                  <p className="text-sm text-gray-500">
                    Permite registro directo sin invitación
                  </p>
                </div>
                <Switch
                  id="allow_registration"
                  checked={settings.allow_registration}
                  onCheckedChange={(checked) => handleSettingChange('allow_registration', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="admin_approval_required">Aprobación de Administrador Requerida</Label>
                  <p className="text-sm text-gray-500">
                    Nuevos administradores requieren aprobación
                  </p>
                </div>
                <Switch
                  id="admin_approval_required"
                  checked={settings.admin_approval_required}
                  onCheckedChange={(checked) => handleSettingChange('admin_approval_required', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuraciones de Invitaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Configuraciones de Invitaciones
              </CardTitle>
              <CardDescription>
                Gestión del sistema de invitaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="invitation_expiry_days">Días de Expiración de Invitaciones</Label>
                <Input
                  id="invitation_expiry_days"
                  type="number"
                  min="1"
                  max="365"
                  value={settings.invitation_expiry_days}
                  onChange={(e) => handleSettingChange('invitation_expiry_days', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Los tokens de invitación expirarán después de esta cantidad de días
                </p>
              </div>

              <div>
                <Label htmlFor="max_invitations_per_admin">Máximo de Invitaciones por Administrador</Label>
                <Input
                  id="max_invitations_per_admin"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.max_invitations_per_admin}
                  onChange={(e) => handleSettingChange('max_invitations_per_admin', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Límite de invitaciones activas por administrador
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_notifications">Notificaciones por Email</Label>
                  <p className="text-sm text-gray-500">
                    Enviar emails automáticos para eventos importantes
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuraciones de Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Configuraciones de Seguridad
              </CardTitle>
              <CardDescription>
                Configuraciones relacionadas con la seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="session_timeout">Tiempo de Sesión (minutos)</Label>
                <Select 
                  value={settings.session_timeout?.toString()} 
                  onValueChange={(value) => handleSettingChange('session_timeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="480">8 horas</SelectItem>
                    <SelectItem value="1440">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="force_password_change">Forzar Cambio de Contraseña</Label>
                  <p className="text-sm text-gray-500">
                    Requerir cambio de contraseña en primer login
                  </p>
                </div>
                <Switch
                  id="force_password_change"
                  checked={settings.force_password_change}
                  onCheckedChange={(checked) => handleSettingChange('force_password_change', checked)}
                />
              </div>

              <div>
                <Label htmlFor="password_min_length">Longitud Mínima de Contraseña</Label>
                <Input
                  id="password_min_length"
                  type="number"
                  min="6"
                  max="50"
                  value={settings.password_min_length}
                  onChange={(e) => handleSettingChange('password_min_length', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuraciones del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Configuraciones del Sistema
              </CardTitle>
              <CardDescription>
                Configuraciones técnicas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="max_file_size">Tamaño Máximo de Archivo (MB)</Label>
                <Input
                  id="max_file_size"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.max_file_size}
                  onChange={(e) => handleSettingChange('max_file_size', parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="items_per_page">Elementos por Página</Label>
                <Select 
                  value={settings.items_per_page?.toString()} 
                  onValueChange={(value) => handleSettingChange('items_per_page', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="system_maintenance">Modo de Mantenimiento</Label>
                  <p className="text-sm text-gray-500">
                    Solo administradores pueden acceder al sistema
                  </p>
                </div>
                <Switch
                  id="system_maintenance"
                  checked={settings.system_maintenance}
                  onCheckedChange={(checked) => handleSettingChange('system_maintenance', checked)}
                />
              </div>

              {settings.system_maintenance && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    El sistema está en modo de mantenimiento. Solo los administradores pueden acceder.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sección de Base de Datos */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Gestión de Base de Datos
              </CardTitle>
              <CardDescription>
                Herramientas de mantenimiento de la base de datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" onClick={() => adminAPI.backupDatabase()}>
                  <Database className="h-4 w-4 mr-2" />
                  Crear Backup
                </Button>
                <Button variant="outline" onClick={() => adminAPI.optimizeDatabase()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Optimizar Base de Datos
                </Button>
                <Button variant="outline" onClick={() => adminAPI.cleanExpiredInvitations()}>
                  <Mail className="h-4 w-4 mr-2" />
                  Limpiar Invitaciones Expiradas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;