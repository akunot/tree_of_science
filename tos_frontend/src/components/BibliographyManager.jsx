import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bibliographyAPI } from '../lib/api';
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
  BookOpen, 
  Upload, 
  Search, 
  Download, 
  Trash2, 
  Calendar,
  MoreHorizontal,
  FileText,
  File,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BibliographyManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Consultar bibliografías
  const { data: bibliographies = [], isLoading, error } = useQuery({
    queryKey: ['bibliographies'],
    queryFn: () => bibliographyAPI.list().then(res => res.data),
  });

  // Mutación para subir archivo
  const uploadMutation = useMutation({
    mutationFn: bibliographyAPI.upload,
    onSuccess: () => {
      queryClient.invalidateQueries(['bibliographies']);
      toast({
        title: "Archivo subido",
        description: "La bibliografía ha sido subida exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.archivo?.[0] || "No se pudo subir el archivo. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar bibliografía
  const deleteMutation = useMutation({
    mutationFn: bibliographyAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['bibliographies']);
      toast({
        title: "Bibliografía eliminada",
        description: "La bibliografía ha sido eliminada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la bibliografía. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Mutación para descargar bibliografía
  const downloadMutation = useMutation({
    mutationFn: bibliographyAPI.download,
    onSuccess: (response, id) => {
      const bibliography = bibliographies.find(b => b.id === id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', bibliography?.nombre_archivo || `bibliografia_${id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Descarga iniciada",
        description: "El archivo se está descargando.",
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

  const handleFileUpload = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('nombre_archivo', file.name);
      uploadMutation.mutate(formData);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Está seguro de que desea eliminar "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = (id) => {
    downloadMutation.mutate(id);
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'txt':
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  // Filtrar bibliografías por término de búsqueda
  const filteredBibliographies = bibliographies.filter(bibliography =>
    bibliography.nombre_archivo?.toLowerCase().includes(searchTerm.toLowerCase())
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
              Error al cargar las bibliografías
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
          <div className="p-2 bg-green-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Bibliografías</h1>
            <p className="text-gray-600 mt-1">
              Suba y gestione sus archivos de referencia
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Archivos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bibliographies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bibliographies.filter(bib => {
                const bibDate = new Date(bib.fecha_subida);
                const now = new Date();
                return bibDate.getMonth() === now.getMonth() && 
                       bibDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Archivo</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(bibliographies.map(bib => 
                bib.nombre_archivo.split('.').pop()?.toLowerCase()
              )).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zona de subida */}
      <Card>
        <CardHeader>
          <CardTitle>Subir Nueva Bibliografía</CardTitle>
          <CardDescription>
            Arrastre y suelte archivos o haga clic para seleccionar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                Subir archivos de bibliografía
              </p>
              <p className="text-gray-600">
                Formatos soportados: PDF, DOC, DOCX, TXT
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subiendo...
                    </div>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Seleccionar Archivo
                    </>
                  )}
                </Button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Barra de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Bibliografías</CardTitle>
          <CardDescription>
            Busque por nombre de archivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar archivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de bibliografías */}
      <Card>
        <CardHeader>
          <CardTitle>Archivos de Bibliografía ({filteredBibliographies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBibliographies.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron archivos' : 'No hay bibliografías subidas'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Intente con otros términos de búsqueda'
                  : 'Comience subiendo su primera bibliografía'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Subir Primer Archivo
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha de Subida</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBibliographies.map((bibliography) => (
                    <TableRow key={bibliography.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getFileIcon(bibliography.nombre_archivo)}
                          <div>
                            <div className="font-medium">{bibliography.nombre_archivo}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {bibliography.nombre_archivo.split('.').pop()?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(bibliography.fecha_subida)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDownload(bibliography.id)}
                              disabled={downloadMutation.isPending}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Descargar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(bibliography.id, bibliography.nombre_archivo)}
                              disabled={deleteMutation.isPending}
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

export default BibliographyManager;

