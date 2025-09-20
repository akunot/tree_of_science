import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treeAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  History, 
  TreePine, 
  Search, 
  Eye, 
  Download, 
  Trash2, 
  Calendar,
  MoreHorizontal,
  FileText,
  FileJson
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TreeHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Consultar historial de árboles
  const { data: trees = [], isLoading, error } = useQuery({
    queryKey: ['trees'],
    queryFn: () => treeAPI.history().then(res => res.data),
  });

  // Mutación para eliminar árbol
  const deleteTreeMutation = useMutation({
    mutationFn: treeAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['trees']);
      toast({
        title: "Árbol eliminado",
        description: "El árbol ha sido eliminado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el árbol. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Mutación para descargar árbol
  const downloadTreeMutation = useMutation({
    mutationFn: ({ id, format }) => treeAPI.download(id, format),
    onSuccess: (response, { format, title }) => {
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'arbol'}.${format}`);
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

  const handleDelete = (id, title) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el árbol "${title || `ID: ${id}`}"?`)) {
      deleteTreeMutation.mutate(id);
    }
  };

  const handleDownload = (id, format, title) => {
    downloadTreeMutation.mutate({ id, format, title });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filtrar árboles por término de búsqueda
  const filteredTrees = trees.filter(tree =>
    tree.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.seed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.bibliography_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error al cargar el historial de árboles
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <History className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historial de Árboles</h1>
            <p className="text-gray-600 mt-1">
              Gestione y explore sus árboles de la ciencia generados
            </p>
          </div>
        </div>
        <Button asChild>
          <Link to="/generate">
            <TreePine className="mr-2 h-4 w-4" />
            Generar Nuevo Árbol
          </Link>
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Árboles</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trees.filter(tree => {
                const treeDate = new Date(tree.fecha_generado);
                const now = new Date();
                return treeDate.getMonth() === now.getMonth() && 
                       treeDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Bibliografía</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trees.filter(tree => tree.bibliography_name).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Árboles</CardTitle>
          <CardDescription>
            Busque por título, semilla o bibliografía
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar árboles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de árboles */}
      <Card>
        <CardHeader>
          <CardTitle>Árboles Generados ({filteredTrees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTrees.length === 0 ? (
            <div className="text-center py-12">
              <TreePine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron árboles' : 'No hay árboles generados'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Intente con otros términos de búsqueda'
                  : 'Comience generando su primer árbol de la ciencia'
                }
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link to="/generate">Generar Primer Árbol</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Semilla</TableHead>
                    <TableHead>Bibliografía</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrees.map((tree) => (
                    <TableRow key={tree.id}>
                      <TableCell className="font-medium">
                        <Link 
                          to={`/tree/${tree.id}`}
                          className="text-blue-600 hover:text-blue-500"
                        >
                          {tree.title || `Árbol ${tree.id}`}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-gray-600">
                          {tree.seed}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tree.bibliography_name ? (
                          <Badge variant="secondary" className="text-xs">
                            {tree.bibliography_name}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin bibliografía</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(tree.fecha_generado)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/tree/${tree.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownload(tree.id, 'json', tree.title)}
                              disabled={downloadTreeMutation.isPending}
                            >
                              <FileJson className="mr-2 h-4 w-4" />
                              Descargar JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownload(tree.id, 'pdf', tree.title)}
                              disabled={downloadTreeMutation.isPending}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Descargar PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(tree.id, tree.title)}
                              disabled={deleteTreeMutation.isPending}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TreeHistory;

