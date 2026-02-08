import { useState, useEffect } from 'react';
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
  FileJson,
  Sheet,
  FileDown,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TreeHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrees, setSelectedTrees] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Debounce del término de búsqueda
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 700);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Consultar historial de árboles (paginado + búsqueda en backend)
  const { data, isLoading, error } = useQuery({
    queryKey: ['trees', page, pageSize, debouncedSearch],
    queryFn: () =>
      treeAPI
        .history({
          page,
          page_size: pageSize,
          // Solo mandar search si tiene al menos 2 caracteres
          search: debouncedSearch && debouncedSearch.length >= 2 ? debouncedSearch : undefined,
        })
        .then((res) => res.data),
    keepPreviousData: true,
  });

  const trees = data?.results || [];
  const totalTrees = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalTrees / pageSize));

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

  // ========== FUNCIÓN: GENERAR PDF ==========
  const generatePDFFromTree = async (tree) => {
    try {
      toast({
        title: 'Preparando PDF...',
        description: 'Generando documento en el servidor.',
        duration: 1500,
      });

      const response = await treeAPI.download(tree.id, 'pdf');

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const safeTitle = String(tree.title || 'tree')
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      link.href = url;
      link.download = `arbol-${safeTitle}-${new Date()
        .toISOString()
        .split('T')[0]}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: '✓ Éxito',
        description: 'PDF descargado correctamente.',
        duration: 2000,
      });
      return true;
    } catch (error) {
      console.error('Error descargando PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar el PDF. Verifica la conexión.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // ========== FUNCIÓN: GENERAR CSV ==========
  const generateCSVFromTree = async (tree) => {
    try {
      let treeData = tree;
      // Si no hay arbol_json, obtener detalles completos del árbol
      if (!tree?.arbol_json?.nodes) {
        toast({
          title: "Cargando datos...",
          description: "Obteniendo información del árbol.",
          duration: 2000,
        });
        const response = await treeAPI.detail(tree.id);
        treeData = response.data;
      }

      const {nodes} = treeData.arbol_json;
      if (!nodes || nodes.length === 0) {
        toast({
          title: "Error",
          description: "El árbol no tiene datos para exportar",
          variant: "destructive",
        });
        return false;
      }

      const headers = [
        'ID',
        'Título',
        'Tipo',
        'Grupo',
        'Año',
        'Autores',
        'DOI',
        'PMID',
        'arXiv',
        'URL',
        'Raíz',
        'Tronco',
        'Hoja',
        'SAP',
        'Citas'
      ];

      const rows = nodes.map(node => [
        node?.id || '',
        String(node?.label || '').replace(/"/g, '""').substring(0, 100),
        String(node?.type_label || '').replace(/"/g, '""'),
        node?.group || '',
        node?.year || '',
        Array.isArray(node?.authors) 
          ? node.authors.join('; ')
          : String(node?.authors || ''),
        node?.doi || '',
        node?.pmid || '',
        node?.arxiv_id || '',
        node?.url || '',
        node?.root || 0,
        node?.trunk || 0,
        node?.leaf || 0,
        node?._sap || 0,
        node?.times_cited || 0
      ]);

      const csvContent = [headers, ...rows]
        .map(row =>
          row
            .map(cell => {
              const cellString = String(cell || '');
              const needsQuotes = cellString.includes(',') || 
                                 cellString.includes('"') || 
                                 cellString.includes('\n');
              return needsQuotes 
                ? `"${cellString.replace(/"/g, '""')}"` 
                : cellString;
            })
            .join(',')
        )
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arbol-${String(treeData.title || 'tree').replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: '✓ Éxito',
        description: `CSV generado con ${nodes.length} nodos`,
        duration: 2000,
      });
      return true;
    } catch (error) {
      console.error('Error generando CSV:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el CSV. Verifica la conexión.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // ========== FUNCIÓN: DESCARGAR JSON ==========
  const downloadJSON = async (tree) => {
    try {
      let treeData = tree;
      // Si no hay arbol_json, obtener detalles completos del árbol
      if (!tree?.arbol_json?.nodes) {
        toast({
          title: "Cargando datos...",
          description: "Obteniendo información del árbol.",
          duration: 2000,
        });
        const response = await treeAPI.detail(tree.id);
        treeData = response.data;
      }

      const nodes = treeData.arbol_json?.nodes || [];
      const stats = treeData.arbol_json?.statistics || {};

      const exportData = {
        title: treeData.title,
        seed: treeData.seed,
        bibliography_name: treeData.bibliography_name,
        statistics: stats,
        generated_at: treeData.fecha_generado,
        total_nodes: nodes.length,
        nodes: nodes
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arbol-${String(treeData.title || 'tree').replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: '✓ Éxito',
        description: `JSON descargado con ${nodes.length} nodos`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error descargando JSON:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar el JSON. Verifica la conexión.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el árbol "${title || `ID: ${id}`}"?`)) {
      deleteTreeMutation.mutate(id);
    }
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
   const filteredTrees = trees;

  // Toggle selección de árbol
  const toggleTreeSelection = (treeId) => {
    setSelectedTrees(prev => 
      prev.includes(treeId)
        ? prev.filter(id => id !== treeId)
        : [...prev, treeId]
    );
  };

  // Seleccionar/deseleccionar todos
  const toggleSelectAll = () => {
    if (selectedTrees.length === filteredTrees.length) {
      setSelectedTrees([]);
    } else {
      setSelectedTrees(filteredTrees.map(t => t.id));
    }
  };

  // Descargar múltiples en CSV consolidado
  const handleDownloadConsolidated = () => {
    if (selectedTrees.length === 0) {
      toast({
        title: "Aviso",
        description: "Selecciona al menos un árbol para descargar.",
      });
      return;
    }

    try {
      const treesToExport = filteredTrees.filter(t => selectedTrees.includes(t.id));
      
      const csvData = [
        ['ID', 'Título', 'Semilla', 'Bibliografía', 'Fecha', 'Nodos', 'Raíces', 'Troncos', 'Hojas'],
        ...treesToExport.map(tree => [
          tree?.id || '',
          String(tree?.title || '').replace(/"/g, '""'),
          String(tree?.seed || '').replace(/"/g, '""'),
          String(tree?.bibliography_name || '').replace(/"/g, '""'),
          formatDate(tree?.fecha_generado),
          tree?.nodes_count ?? 0,
          tree?.arbol_json?.statistics?.roots || 0,
          tree?.arbol_json?.statistics?.trunks || 0,
          tree?.arbol_json?.statistics?.leaves || 0,
        ])
      ];

      const csvContent = csvData
        .map(row =>
          row
            .map(cell => {
              const cellString = String(cell || '');
              const needsQuotes = cellString.includes(',') || 
                                 cellString.includes('"') || 
                                 cellString.includes('\n');
              return needsQuotes 
                ? `"${cellString.replace(/"/g, '""')}"` 
                : cellString;
            })
            .join(',')
        )
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arboles-consolidado-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: '✓ Éxito',
        description: `${treesToExport.length} árbol(es) exportado(s)`,
        duration: 2000,
      });
      setSelectedTrees([]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar los árboles',
        variant: 'destructive',
      });
    }
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
              Gestione y exporte sus árboles de la ciencia
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
            <div className="text-2xl font-bold">{totalTrees}</div>
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

      {/* Barra de búsqueda y acciones */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Buscar y Descargar</CardTitle>
              <CardDescription>
                Busque por título, semilla o bibliografía
              </CardDescription>
            </div>
            {selectedTrees.length > 0 && (
              <Button 
                onClick={handleDownloadConsolidated}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar {selectedTrees.length} CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar árboles..."
              value={searchTerm}
              onChange={(e) => {
                const {value} = e.target;
                setSearchTerm(value);
                // Siempre que cambia el término de búsqueda, volvemos a la página 1
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de árboles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Árboles Generados ({filteredTrees.length})</CardTitle>
            {filteredTrees.length > 0 && (
              <Button 
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
                {selectedTrees.length === filteredTrees.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
              </Button>
            )}
          </div>
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
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input 
                        type="checkbox"
                        checked={selectedTrees.length === filteredTrees.length && filteredTrees.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Semilla</TableHead>
                    <TableHead>Bibliografía</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Nodos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrees.map((tree) => (
                    <TableRow 
                      key={tree.id}
                      className={selectedTrees.includes(tree.id) ? 'bg-blue-50' : ''}
                    >
                      <TableCell>
                        <input 
                          type="checkbox"
                          checked={selectedTrees.includes(tree.id)}
                          onChange={() => toggleTreeSelection(tree.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
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
                      <TableCell className="text-sm font-medium">
                        {tree.nodes_count ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem asChild>
                              <Link to={`/tree/${tree.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                              </Link>
                            </DropdownMenuItem>

                            {/* Descargar PDF */}
                            <DropdownMenuItem
                              onClick={() => generatePDFFromTree(tree)}
                            >
                              <FileDown className="mr-2 h-4 w-4 text-red-500" />
                              <span>Descargar PDF</span>
                            </DropdownMenuItem>

                            {/* Descargar CSV */}
                            <DropdownMenuItem
                              onClick={() => generateCSVFromTree(tree)}
                            >
                              <Sheet className="mr-2 h-4 w-4 text-green-500" />
                              <span>Descargar CSV</span>
                            </DropdownMenuItem>

                            {/* Descargar JSON */}
                            <DropdownMenuItem
                              onClick={() => downloadJSON(tree)}
                            >
                              <FileJson className="mr-2 h-4 w-4 text-blue-500" />
                              <span>Descargar JSON</span>
                            </DropdownMenuItem>

                            {/* Separador */}
                            <div className="my-1 border-t border-gray-200" />

                            {/* Eliminar */}
                            <DropdownMenuItem
                              onClick={() => handleDelete(tree.id, tree.title)}
                              disabled={deleteTreeMutation.isPending}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Eliminar</span>
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-sm">
          <span>
            Página {page} de {totalPages} (total: {totalTrees})
          </span>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Info de descarga */}
      {filteredTrees.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">💡 Consejo: Descarga en Múltiples Formatos</p>
                <p>Cada árbol se puede descargar como PDF (para imprimir), CSV (para Excel), o JSON (datos completos).</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TreeHistory;