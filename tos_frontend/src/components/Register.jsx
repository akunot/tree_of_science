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
import { 
  TreePine, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle, 
  AlertCircle,
  Shield,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';

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
  const [tokenCopied, setTokenCopied] = useState(false);

  // Verificar si hay token en URL al cargar
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setFormData(prev => ({ ...prev, invitation_token: tokenFromUrl }));
      // Auto-verificar si hay token en URL
      setTimeout(() => {
        handleVerifyTokenWithValue(tokenFromUrl);
      }, 500);
    }
  }, [searchParams]);

  // Mutación para verificar token de invitación
  const verifyTokenMutation = useMutation({
    mutationFn: (token) => authAPI.verifyInvitation(token),
    onSuccess: (response) => {
      const data = response.data || response;
      setInvitationData(data);
      setFormData(prev => ({ 
        ...prev, 
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || ''
      }));
      setCurrentStep('register');
      setErrors({});
    },
    onError: (error) => {
      console.error('Error verificando token:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          error.message ||
                          'Token inválido o expirado';
      setErrors({ invitation_token: [errorMessage] });
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
      console.error('Error en registro:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Error al completar registro. Intente nuevamente.' });
      }
    },
  });

  const handleVerifyTokenWithValue = (tokenValue) => {
    setErrors({});
    if (!tokenValue) {
      setErrors({ invitation_token: ['Por favor ingrese el token de invitación'] });
      return;
    }
    verifyTokenMutation.mutate(tokenValue);
  };

  const handleVerifyToken = (e) => {
    e.preventDefault();
    handleVerifyTokenWithValue(formData.invitation_token);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrors({});
    
    // Validaciones
    if (!formData.first_name.trim()) {
      setErrors(prev => ({ ...prev, first_name: ['El nombre es requerido'] }));
      return;
    }
    
    if (!formData.last_name.trim()) {
      setErrors(prev => ({ ...prev, last_name: ['El apellido es requerido'] }));
      return;
    }
    
    if (formData.password.length < 8) {
      setErrors(prev => ({ ...prev, password: ['La contraseña debe tener al menos 8 caracteres'] }));
      return;
    }
    
    if (formData.password !== formData.password_confirm) {
      setErrors(prev => ({ ...prev, password_confirm: ['Las contraseñas no coinciden'] }));
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-lg">
              <TreePine className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Árbol de la Ciencia
          </h1>
          <p className="text-gray-600 font-medium">
            Universidad Nacional de Colombia
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Portal de Investigación Colaborativa
          </p>
        </div>

        {/* Indicador de paso */}
        {currentStep === 'register' && (
          <div className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <span>Token verificado</span>
            </div>
            <ArrowRight className="w-4 h-4" />
            <div className="flex items-center space-x-1">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span>Completar registro</span>
            </div>
          </div>
        )}

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
            <CardTitle className="text-2xl text-center">
              {currentStep === 'verify' ? 'Verificar Invitación' : 'Completar Registro'}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === 'verify' 
                ? 'Ingrese su token de invitación para continuar'
                : 'Complete su información personal para crear su cuenta'
              }
            </CardDescription>
          </CardHeader>
          
          {currentStep === 'verify' ? (
            // Paso 1: Verificar token de invitación
            <form onSubmit={handleVerifyToken}>
              <CardContent className="space-y-4 pt-6">
                {errors.general && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="invitation_token" className="font-medium">Token de Invitación</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="invitation_token"
                      name="invitation_token"
                      type="text"
                      placeholder="ej: aae98f25-4830-48f4-acd9-8149d05c3390"
                      value={formData.invitation_token}
                      onChange={handleChange}
                      className="pl-10 font-mono text-sm"
                      required
                    />
                  </div>
                  {errors.invitation_token && (
                    <div className="flex items-center space-x-1 text-sm text-red-600 bg-red-50 p-2 rounded">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{errors.invitation_token[0]}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Ingrese el token que recibió en su correo electrónico
                  </p>
                </div>

                {/* Información sobre el sistema */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Registro Seguro por Invitación</p>
                      <p className="text-blue-800 text-xs leading-relaxed">
                        Este sistema requiere una invitación válida de un administrador para garantizar la calidad y seguridad de la plataforma. Si no ha recibido una invitación, contacte a su administrador.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Beneficios */}
                <div className="grid grid-cols-1 gap-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2 text-xs">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Acceso a herramientas de análisis colaborativo</span>
                  </div>
                  <div className="flex items-start space-x-2 text-xs">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Gestión de proyectos de investigación</span>
                  </div>
                  <div className="flex items-start space-x-2 text-xs">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Bibliografía compartida y recursos</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 rounded-b-lg border-t pt-6">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={verifyTokenMutation.isPending}
                >
                  {verifyTokenMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verificando invitación...
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Verificar Invitación</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </CardFooter>
            </form>
          ) : (
            // Paso 2: Completar información personal
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-6">
                {errors.general && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                {/* Token verificado exitosamente */}
                {invitationData && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-900">
                        <p className="font-semibold">Invitación verificada ✓</p>
                        <p className="text-green-800 text-xs mt-1">
                          Email: <strong>{invitationData.email}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="font-medium">Nombre</Label>
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
                      <p className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.first_name[0]}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="font-medium">Apellido</Label>
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
                      <p className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.last_name[0]}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="correo@unal.edu.co"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 bg-gray-50 cursor-not-allowed"
                      required
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Email predefinido desde la invitación (no editable)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
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
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.password[0]}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirm" className="font-medium">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password_confirm"
                      name="password_confirm"
                      type={showPasswordConfirm ? 'text' : 'password'}
                      placeholder="Repita la contraseña"
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
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.password_confirm[0]}</span>
                    </p>
                  )}
                  {errors.non_field_errors && (
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.non_field_errors[0]}</span>
                    </p>
                  )}
                </div>

                {/* Requisitos de contraseña */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Requisitos de contraseña:</p>
                  <div className="space-y-1 text-xs text-blue-800">
                    <div className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-600'}>
                      ✓ Mínimo 8 caracteres
                    </div>
                    <div className={formData.password === formData.password_confirm && formData.password ? 'text-green-600' : 'text-gray-600'}>
                      ✓ Contraseñas coinciden
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 rounded-b-lg border-t flex flex-col space-y-3 pt-6">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
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

                <div className="text-center text-sm text-gray-600 border-t pt-4">
                  ¿Ya tiene una cuenta?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-500 font-semibold"
                  >
                    Inicie sesión aquí
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2025 Árbol de la Ciencia - Universidad Nacional de Colombia</p>
          <p className="mt-1">Plataforma de investigación colaborativa</p>
        </div>
      </div>
    </div>
  );
};

export default Register;