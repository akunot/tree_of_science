import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { treeAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TreePine, 
  Calendar, 
  BookOpen, 
  Download, 
  ArrowLeft,
  FileJson,
  FileText,
  Sparkles,
  Network,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TreeDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();

  // Consultar detalles del árbol
  const { data: tree, isLoading, error } = useQuery({
    queryKey: ['tree', id],
    queryFn: () => treeAPI.detail(id).then(res => res.data),
    enabled: !!id,
  });

  // Mutación para descargar árbol
  const downloadTreeMutation = useMutation({
    mutationFn: ({ format }) => treeAPI.download(id, format),
    onSuccess: (response, { format }) => {
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tree?.title || `arbol_${id}`}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Descarga iniciada",
        description: `El archivo ${format.toUpperCase()} se está descargando.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  const handleDownload = (format) => {
    downloadTreeMutation.mutate({ format });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTreeNode = (node, level = 0) => {
    const indentClass = level > 0 ? `ml-${level * 4}` : '';
    const nodeTypeColors = {
      root: 'bg-blue-100 text-blue-800 border-blue-200',
      branch: 'bg-green-100 text-green-800 border-green-200',
      leaf: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    return (
      <div key={node.id} className={`${indentClass} mb-2`}>
        <div className={`p-3 rounded-lg border ${nodeTypeColors[node.type] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{node.label}</span>
            <Badge variant="outline" className="text-xs">
              {node.type}
            </Badge>
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="mt-2">
            {tree.arbol_json.nodes
              .filter(n => node.children.includes(n.id))
              .map(childNode => renderTreeNode(childNode, level + 1))
            }
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TreePine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Árbol no encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                El árbol solicitado no existe o no tiene permisos para verlo.
              </p>
              <Button asChild>
                <Link to="/history">Volver al historial</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rootNode = tree.arbol_json?.nodes?.find(node => node.type === 'root');

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {tree.title || `Árbol ${tree.id}`}
            </h1>
            <p className="text-gray-600 mt-1">
              Detalles y visualización del árbol de la ciencia
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handleDownload('json')}
            disabled={downloadTreeMutation.isPending}
          >
            <FileJson className="mr-2 h-4 w-4" />
            JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDownload('pdf')}
            disabled={downloadTreeMutation.isPending}
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del árbol */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de Generación</label>
                <div className="flex items-center mt-1">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(tree.fecha_generado)}</span>
                </div>
              </div>

              {tree.bibliography && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Bibliografía</label>
                  <div className="flex items-center mt-1">
                    <BookOpen className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="text-sm">{tree.bibliography.nombre_archivo}</span>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-600">Semilla Original</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">{tree.seed}</p>
                </div>
              </div>

              {tree.arbol_json?.metadata && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Metadatos</label>
                    <div className="mt-1 space-y-2">
                      {tree.arbol_json.metadata.algorithm_version && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Versión del algoritmo:</span>
                          <span>{tree.arbol_json.metadata.algorithm_version}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total de nodos:</span>
                        <span>{tree.arbol_json.nodes?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Estadísticas del árbol */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="mr-2 h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nodos raíz:</span>
                  <span className="text-sm font-medium">
                    {tree.arbol_json?.nodes?.filter(n => n.type === 'root').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ramas:</span>
                  <span className="text-sm font-medium">
                    {tree.arbol_json?.nodes?.filter(n => n.type === 'branch').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hojas:</span>
                  <span className="text-sm font-medium">
                    {tree.arbol_json?.nodes?.filter(n => n.type === 'leaf').length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualización del árbol */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TreePine className="mr-2 h-5 w-5" />
                Estructura del Árbol
              </CardTitle>
              <CardDescription>
                Visualización jerárquica del árbol de conocimiento generado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="tree-visualization p-4 rounded-lg border-2 border-dashed border-gray-200 min-h-[400px]">
                {rootNode ? (
                  <div className="space-y-2">
                    {renderTreeNode(rootNode)}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <TreePine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">
                        No se pudo cargar la estructura del árbol
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Datos JSON del árbol */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileJson className="mr-2 h-5 w-5" />
                Datos del Árbol (JSON)
              </CardTitle>
              <CardDescription>
                Representación completa de los datos del árbol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(tree.arbol_json, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TreeDetail;

