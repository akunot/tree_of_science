import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TreePine, Mail, User, Building, FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';

const AdminRequest = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    affiliation: '',
    justification: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [justLength, setJustLength] = useState(0);

  const navigate = useNavigate();

  // Mutación para enviar solicitud
  const requestMutation = useMutation({
    mutationFn: authAPI.requestAdminAccess,
    onSuccess: (response) => {
      setShowSuccess(true);
      setErrors({});
    },
    onError: (error) => {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Error al enviar solicitud. Intente nuevamente.' });
      }
    },
  });

  useEffect(() => {
    if (showSuccess) {
      const t = setTimeout(() => {
        setShowSuccess(false);
        navigate('/');
      }, 4500);
      return () => clearTimeout(t);
    }
  }, [showSuccess, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    // Validación mínima cliente
    if ((formData.justification || '').trim().length < 50) {
      setErrors({ justification: ['La justificación debe tener al menos 50 caracteres.'] });
      return;
    }
    requestMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'justification') {
      setJustLength(value.length);
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 flex flex-col items-center text-center">
            <div className="bg-green-100 rounded-full p-4 mb-4 transform transition-transform animate-pulse">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Solicitud enviada</h1>
            <p className="text-gray-600 mb-6 max-w-xl">
              Su solicitud para acceso de administrador ha sido enviada. En breve será revisada por el equipo.
            </p>

            <div className="w-full grid gap-3 sm:grid-cols-2">
              <Button onClick={() => navigate('/')} className="w-full" >
                Volver al inicio
              </Button>
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Ir al inicio de sesión
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500">Se le redirigirá automáticamente en unos segundos.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Branding / Info lateral */}
          <div className="hidden lg:flex flex-col items-start justify-center space-y-6 p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <TreePine className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Árbol de la Ciencia</h2>
                <p className="text-sm text-gray-600">Universidad Nacional de Colombia</p>
              </div>
            </div>

            <div className="text-gray-700">
              <h3 className="text-lg font-semibold mb-2">Solicitud de administrador</h3>
              <p className="text-sm">
                Complete el formulario para solicitar acceso. El equipo revisará su petición y le notificará por correo.
              </p>
            </div>

            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-1" /> Revisión en 1-3 días hábiles</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-1" /> Notificación por correo</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-1" /> Recibirá token si es aprobado</li>
            </ul>
          </div>

          {/* Formulario */}
          <Card className="shadow-2xl rounded-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="sm:flex sm:flex-col">
              <CardHeader className="p-6 bg-white">
                <CardTitle className="text-2xl text-gray-900">Solicitud de Administrador</CardTitle>
                <CardDescription className="text-sm text-gray-600">Complete el formulario para solicitar acceso de administrador</CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4 bg-white">
                {errors.general && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
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
                          aria-invalid={!!errors.first_name}
                        />
                      </div>
                      {errors.first_name && <p className="text-sm text-red-600">{errors.first_name[0]}</p>}
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
                          aria-invalid={!!errors.last_name}
                        />
                      </div>
                      {errors.last_name && <p className="text-sm text-red-600">{errors.last_name[0]}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico Institucional</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="correo@unal.edu.co"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10"
                        required
                        aria-invalid={!!errors.email}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-600">{errors.email[0]}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono de Contacto</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+57 300 123 4567"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full"
                        required
                        aria-invalid={!!errors.phone}
                      />
                      {errors.phone && <p className="text-sm text-red-600">{errors.phone[0]}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affiliation">Afiliación Institucional</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="affiliation"
                          name="affiliation"
                          type="text"
                          placeholder="Universidad, departamento, cargo"
                          value={formData.affiliation}
                          onChange={handleChange}
                          className="pl-10"
                          required
                          aria-invalid={!!errors.affiliation}
                        />
                      </div>
                      {errors.affiliation && <p className="text-sm text-red-600">{errors.affiliation[0]}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="justification">Justificación para Acceso de Administrador</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        id="justification"
                        name="justification"
                        placeholder="Explique por qué necesita acceso de administrador. Incluya su rol, responsabilidades y cómo planea usar el sistema."
                        value={formData.justification}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[110px]"
                        rows="5"
                        required
                        aria-invalid={!!errors.justification}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <p>{errors.justification ? <span className="text-red-600">{errors.justification[0]}</span> : 'Mínimo 50 caracteres'}</p>
                      <p className={`font-mono ${justLength < 50 ? 'text-red-600' : 'text-green-600'}`}>{justLength} / 500</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Proceso de Solicitud</p>
                        <p className="text-blue-700">
                          Su solicitud será revisada por los administradores actuales. El proceso puede tomar entre 1-3 días hábiles. Recibirá una notificación por email sobre el resultado.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 bg-white flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={requestMutation.isPending}
                >
                  {requestMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Solicitud
                    </div>
                  )}
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRequest;
