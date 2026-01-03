import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth.jsx';
import { authAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TreePine, Mail, Lock, User, Eye, EyeOff, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Estado principal
  const [currentStep, setCurrentStep] = useState('verify'); // 'verify' o 'register'
  const [formData, setFormData] = useState({
    invitation_token: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  
  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [invitationData, setInvitationData] = useState(null);

  // Verificar si hay token en URL al cargar
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setFormData(prev => ({ ...prev, invitation_token: tokenFromUrl }));
    }
  }, [searchParams]);

  // Mutación para verificar token de invitación
  const verifyTokenMutation = useMutation({
    mutationFn: () => authAPI.verifyInvitation(formData.invitation_token),
    onSuccess: (response) => {
      setInvitationData(response.data);
      setFormData(prev => ({ 
        ...prev, 
        email: response.data.email,
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || ''
      }));
      setCurrentStep('register');
      setErrors({});
    },
    onError: (error) => {
      if (error.response?.data) {
        setErrors({ invitation_token: [error.response.data.error || 'Token inválido'] });
      } else {
        setErrors({ general: 'Error al verificar invitación. Intente nuevamente.' });
      }
    },
  });

  // Mutación para el registro con invitación
  const registerMutation = useMutation({
    mutationFn: authAPI.registerWithInvitation,
    onSuccess: (response) => {
      login(response.data);
      navigate('/dashboard');
    },
    onError: (error) => {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Error al completar registro. Intente nuevamente.' });
      }
    },
  });

  const handleVerifyToken = (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!formData.invitation_token) {
      setErrors({ invitation_token: ['Por favor ingrese el token de invitación'] });
      return;
    }
    
    verifyTokenMutation.mutate();
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrors({});
    
    if (formData.password !== formData.password_confirm) {
      setErrors({ password_confirm: ['Las contraseñas no coinciden'] });
      return;
    }
    
    registerMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const handleBackToToken = () => {
    setCurrentStep('verify');
    setInvitationData(null);
    setFormData(prev => ({ 
      ...prev, 
      email: '', 
      first_name: '', 
      last_name: '', 
      password: '', 
      password_confirm: '' 
    }));
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <TreePine className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Árbol de la Ciencia
          </h1>
          <p className="text-gray-600">
            Universidad Nacional de Colombia
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {currentStep === 'verify' ? 'Verificar Invitación' : 'Completar Registro'}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === 'verify' 
                ? 'Ingrese su token de invitación para continuar'
                : 'Complete su información personal'
              }
            </CardDescription>
          </CardHeader>
          
          {currentStep === 'verify' ? (
            // Paso 1: Verificar token de invitación
            <form onSubmit={handleVerifyToken}>
              <CardContent className="space-y-4">
                {errors.general && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="invitation_token">Token de Invitación</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="invitation_token"
                      name="invitation_token"
                      type="text"
                      placeholder="Ingrese el token de invitación"
                      value={formData.invitation_token}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.invitation_token && (
                    <div className="flex items-center space-x-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.invitation_token[0]}</span>
                    </div>
                  )}
                </div>

                {/* Información sobre el sistema */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Registro por Invitación</p>
                      <p className="text-blue-700">
                        Este sistema requiere una invitación válida de un administrador. 
                        Contacte a su administrador para obtener el token de invitación.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyTokenMutation.isPending}
                >
                  {verifyTokenMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verificando invitación...
                    </div>
                  ) : (
                    'Verificar Invitación'
                  )}
                </Button>
              </CardFooter>
            </form>
          ) : (
            // Paso 2: Completar información personal
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                {errors.general && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                {/* Token verificado exitosamente */}
                {invitationData && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium">Invitación verificada</p>
                        <p className="text-green-700">
                          Email: <strong>{invitationData.email}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="first_name"
                        name="first_name"
                        type="text"
                        placeholder="Juan"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.first_name && (
                      <p className="text-sm text-red-600">{errors.first_name[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="last_name"
                        name="last_name"
                        type="text"
                        placeholder="Pérez"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.last_name && (
                      <p className="text-sm text-red-600">{errors.last_name[0]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="correo@unal.edu.co"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 bg-gray-50"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Email predefinido desde la invitación
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirm">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password_confirm"
                      name="password_confirm"
                      type={showPasswordConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password_confirm}
                      onChange={handleChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    >
                      {showPasswordConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password_confirm && (
                    <p className="text-sm text-red-600">{errors.password_confirm[0]}</p>
                  )}
                  {errors.non_field_errors && (
                    <p className="text-sm text-red-600">{errors.non_field_errors[0]}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Completando registro...
                    </div>
                  ) : (
                    'Completar Registro'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleBackToToken}
                >
                  Usar otro token
                </Button>

                <div className="text-center text-sm text-gray-600">
                  ¿Ya tiene una cuenta?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Inicie sesión aquí
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Register;