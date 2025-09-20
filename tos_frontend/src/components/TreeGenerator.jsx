import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { treeAPI, bibliographyAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TreePine, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

const TreeGenerator = () => {
  const [formData, setFormData] = useState({
    seed: '',
    title: '',
    bibliography: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Consultar bibliografías disponibles
  const { data: bibliographies = [], isLoading: bibliographiesLoading } = useQuery({
    queryKey: ['bibliographies'],
    queryFn: () => bibliographyAPI.list().then(res => res.data),
  });

  const generateTreeMutation = useMutation({
    mutationFn: treeAPI.generate,
    onSuccess: (response) => {
      navigate(`/tree/${response.data.id}`);
    },
    onError: (error) => {
      setError(
        error.response?.data?.detail ||
        error.response?.data?.seed?.[0] ||
        'Error al generar el árbol. Intente nuevamente.'
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.seed.trim()) {
      setError('La semilla es requerida');
      return;
    }

    const payload = {
      seed: formData.seed,
      title: formData.title || undefined,
      bibliography: formData.bibliography || undefined,
    };

    generateTreeMutation.mutate(payload);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBibliographyChange = (value) => {
    setFormData({
      ...formData,
      bibliography: value === 'none' ? '' : value,
    });
  };

  const seedExamples = [
    "Inteligencia artificial en medicina",
    "Cambio climático y biodiversidad",
    "Computación cuántica aplicaciones",
    "Neurociencia cognitiva",
    "Energías renovables sostenibles"
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <TreePine className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Generar Árbol de la Ciencia</h1>
            <p className="text-gray-600 mt-1">
              Cree un árbol de conocimiento a partir de una semilla conceptual
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
                Configuración del Árbol
              </CardTitle>
              <CardDescription>
                Complete la información necesaria para generar su árbol de la ciencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Semilla */}
                <div className="space-y-2">
                  <Label htmlFor="seed" className="text-base font-medium">
                    Semilla Conceptual *
                  </Label>
                  <Textarea
                    id="seed"
                    name="seed"
                    placeholder="Ingrese el concepto o tema principal para generar el árbol..."
                    value={formData.seed}
                    onChange={handleChange}
                    className="min-h-[100px] resize-none"
                    required
                  />
                  <p className="text-sm text-gray-600">
                    Describa el tema o concepto principal que desea explorar
                  </p>
                </div>

                {/* Título opcional */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">
                    Título del Árbol (Opcional)
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ej: Investigación en IA Médica"
                    value={formData.title}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-600">
                    Asigne un nombre descriptivo a su árbol
                  </p>
                </div>

                {/* Selección de bibliografía */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Bibliografía de Referencia (Opcional)
                  </Label>
                  <Select 
                    value={formData.bibliography || 'none'} 
                    onValueChange={handleBibliographyChange}
                    disabled={bibliographiesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una bibliografía" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin bibliografía</SelectItem>
                      {bibliographies.map((bibliography) => (
                        <SelectItem key={bibliography.id} value={bibliography.id.toString()}>
                          {bibliography.nombre_archivo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600">
                    Seleccione un archivo de referencia para enriquecer el árbol
                  </p>
                </div>

                {/* Botón de generación */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={generateTreeMutation.isPending}
                  >
                    {generateTreeMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generando árbol...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <TreePine className="mr-2 h-4 w-4" />
                        Generar Árbol de la Ciencia
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral con ayuda */}
        <div className="space-y-6">
          {/* Ejemplos de semillas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ejemplos de Semillas</CardTitle>
              <CardDescription>
                Ideas para comenzar su investigación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seedExamples.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, seed: example })}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Información sobre bibliografías */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Bibliografías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Tiene {bibliographies.length} bibliografías disponibles
                </p>
                {bibliographies.length === 0 && (
                  <div className="text-center py-4">
                    <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-3">
                      No hay bibliografías subidas
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/bibliography">Subir archivo</a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información del proceso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <p>Ingrese una semilla conceptual que represente su tema de investigación</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <p>Opcionalmente, seleccione una bibliografía de referencia</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <p>El sistema generará un árbol de conocimiento estructurado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TreeGenerator;

