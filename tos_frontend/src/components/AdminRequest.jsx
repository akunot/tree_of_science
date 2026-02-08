import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { adminAPI  } from '../lib/api';
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

  // VALIDACIÓN COMPLETA DEL FORMULARIO
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.first_name.trim()) {
      newErrors.first_name = ['El nombre es obligatorio'];
    }

    // Validar apellido
    if (!formData.last_name.trim()) {
      newErrors.last_name = ['El apellido es obligatorio'];
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = ['El correo electrónico es obligatorio'];
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = ['Ingrese un correo electrónico válido'];
    }

    // Validar teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = ['El teléfono es obligatorio'];
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = ['Ingrese un teléfono válido (mínimo 10 dígitos)'];
    }

    // Validar afiliación
    if (!formData.affiliation.trim()) {
      newErrors.affiliation = ['La afiliación institucional es obligatoria'];
    }

    // Validar justificación
    if (!formData.justification.trim()) {
      newErrors.justification = ['La justificación es obligatoria'];
    } else if (formData.justification.trim().length < 50) {
      newErrors.justification = ['La justificación debe tener al menos 50 caracteres'];
    } else if (formData.justification.length > 500) {
      newErrors.justification = ['La justificación no puede exceder 500 caracteres'];
    }

    return newErrors;
  };

  // Mutación para enviar solicitud
  const requestMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const response = await adminAPI.submitRequest(data);
        console.log('✅ Respuesta exitosa:', response);
        return response;
      } catch (error) {
        console.error('❌ Error en la solicitud:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log('✅ Solicitud enviada exitosamente');
      setShowSuccess(true);
      setErrors({});
    },
    onError: (error) => {
      console.error('❌ Error en mutación:', error);

      // Manejo de diferentes tipos de errores
      if (error.response?.data) {
        // Si el backend devuelve errores de validación
        setErrors(error.response.data);
      } else if (error.response?.status === 401) {
        setErrors({ general: 'No autorizado. Por favor inicie sesión.' });
      } else if (error.response?.status === 400) {
        setErrors({ general: 'Error en los datos enviados. Verifique el formulario.' });
      } else if (error.response?.status === 500) {
        setErrors({ general: 'Error del servidor. Intente más tarde.' });
      } else if (error.message === 'Network Error') {
        setErrors({ general: 'Error de conexión. Verifique su conexión a internet.' });
      } else {
        setErrors({ 
          general: error.response?.data?.detail || 'Error al enviar la solicitud. Intente nuevamente.' 
        });
      }
    },
  });

  // Redirigir después de éxito
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // EJECUTAR VALIDACIÓN COMPLETA
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      console.log('❌ Errores de validación:', validationErrors);
      setErrors(validationErrors);
      return;
    }

    // Si valida, enviar datos
    console.log('✅ Formulario válido, enviando:', formData);
    setErrors({}); // Limpiar errores previos
    requestMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Actualizar contador de justificación
    if (name === 'justification') {
      setJustLength(value.length);
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // PANTALLA DE ÉXITO
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 flex flex-col items-center text-center">
            <div className="bg-green-100 rounded-full p-4 mb-4 transform transition-transform animate-pulse">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">¡Solicitud enviada!</h1>
            <p className="text-gray-600 mb-6 max-w-xl">
              Su solicitud para acceso de administrador ha sido enviada. En breve será revisada por el equipo. Recibirá una notificación por email.
            </p>

            <div className="w-full grid gap-3 sm:grid-cols-2">
              <Button onClick={() => navigate('/')} className="w-full">
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
          {/* Panel Lateral Informativo */}
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
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" /> 
                Revisión en 1-3 días hábiles
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" /> 
                Notificación por correo
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" /> 
                Recibirá token si es aprobado
              </li>
            </ul>
          </div>

          {/* FORMULARIO */}
          <Card className="shadow-2xl rounded-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="flex flex-col">
              <CardHeader className="p-6 bg-white border-b">
                <CardTitle className="text-2xl text-gray-900">Solicitud de Administrador</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Todos los campos son obligatorios
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4 bg-white">
                {/* Error General */}
                {errors.general && (
                  <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{errors.general}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  {/* Nombre y Apellido */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-gray-700 font-medium">
                        Nombre *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="first_name"
                          name="first_name"
                          type="text"
                          placeholder="Juan"
                          value={formData.first_name}
                          onChange={handleChange}
                          className={`pl-10 ${errors.first_name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          aria-invalid={!!errors.first_name}
                        />
                      </div>
                      {errors.first_name && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.first_name[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-gray-700 font-medium">
                        Apellido *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="last_name"
                          name="last_name"
                          type="text"
                          placeholder="Pérez"
                          value={formData.last_name}
                          onChange={handleChange}
                          className={`pl-10 ${errors.last_name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          aria-invalid={!!errors.last_name}
                        />
                      </div>
                      {errors.last_name && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.last_name[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Correo Electrónico Institucional *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="correo@unal.edu.co"
                        value={formData.email}
                        onChange={handleChange}
                        className={`pl-10 ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        aria-invalid={!!errors.email}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email[0]}
                      </p>
                    )}
                  </div>

                  {/* Teléfono y Afiliación */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">
                        Teléfono de Contacto *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+57 300 123 4567"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        aria-invalid={!!errors.phone}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.phone[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affiliation" className="text-gray-700 font-medium">
                        Afiliación Institucional *
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="affiliation"
                          name="affiliation"
                          type="text"
                          placeholder="Universidad, departamento, cargo"
                          value={formData.affiliation}
                          onChange={handleChange}
                          className={`pl-10 ${errors.affiliation ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          aria-invalid={!!errors.affiliation}
                        />
                      </div>
                      {errors.affiliation && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.affiliation[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Justificación */}
                  <div className="space-y-2">
                    <Label htmlFor="justification" className="text-gray-700 font-medium">
                      Justificación para Acceso de Administrador *
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        id="justification"
                        name="justification"
                        placeholder="Explique por qué necesita acceso de administrador. Incluya su rol, responsabilidades y cómo planea usar el sistema."
                        value={formData.justification}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[110px] ${
                          errors.justification ? 'border-red-500 ring-1 ring-red-500' : ''
                        }`}
                        rows="5"
                        aria-invalid={!!errors.justification}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      {errors.justification ? (
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.justification[0]}
                        </span>
                      ) : (
                        <p className="text-gray-500">Mínimo 50 caracteres, máximo 500</p>
                      )}
                      <p className={`font-mono ${justLength < 50 ? 'text-red-600' : justLength > 500 ? 'text-red-600' : 'text-green-600'}`}>
                        {justLength} / 500
                      </p>
                    </div>
                  </div>

                  {/* Info del Proceso */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Proceso de Solicitud</p>
                        <p>
                          Su solicitud será revisada por los administradores actuales. El proceso puede tomar entre 1-3 días hábiles. Recibirá una notificación por email.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Footer con Botón */}
              <CardFooter className="p-6 bg-gray-50 border-t flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={requestMutation.isPending}
                  size="lg"
                >
                  {requestMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando solicitud...
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
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
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