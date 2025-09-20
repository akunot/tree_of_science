import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { treeAPI, bibliographyAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TreePine, 
  Plus, 
  History, 
  BookOpen, 
  Calendar,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // Consultar historial de árboles
  const { data: trees = [], isLoading: treesLoading } = useQuery({
    queryKey: ['trees'],
    queryFn: () => treeAPI.history().then(res => res.data),
  });

  // Consultar bibliografías
  const { data: bibliographies = [], isLoading: bibliographiesLoading } = useQuery({
    queryKey: ['bibliographies'],
    queryFn: () => bibliographyAPI.list().then(res => res.data),
  });

  const recentTrees = trees.slice(0, 3);
  const recentBibliographies = bibliographies.slice(0, 3);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user?.first_name}
          </h1>
          <p className="text-gray-600 mt-1">
            Gestione sus árboles de la ciencia y bibliografías
          </p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link to="/generate">
              <Plus className="mr-2 h-4 w-4" />
              Generar Árbol
            </Link>
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Árboles Generados</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trees.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de árboles creados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bibliografías</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bibliographies.length}</div>
            <p className="text-xs text-muted-foreground">
              Archivos de referencia
            </p>
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
            <p className="text-xs text-muted-foreground">
              Árboles generados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/generate">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TreePine className="mr-2 h-5 w-5 text-blue-600" />
                Generar Nuevo Árbol
              </CardTitle>
              <CardDescription>
                Cree un árbol de la ciencia a partir de una semilla y bibliografía
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Comience su investigación
                </span>
                <Plus className="h-4 w-4 text-blue-600" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/bibliography">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-green-600" />
                Gestionar Bibliografía
              </CardTitle>
              <CardDescription>
                Suba y organice sus archivos de referencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {bibliographies.length} archivos disponibles
                </span>
                <FileText className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Árboles recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Árboles Recientes
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/history">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {treesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentTrees.length > 0 ? (
              <div className="space-y-4">
                {recentTrees.map((tree) => (
                  <div key={tree.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {tree.title || `Árbol ${tree.id}`}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(tree.fecha_generado)}
                      </p>
                      {tree.bibliography_name && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {tree.bibliography_name}
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/tree/${tree.id}`}>Ver</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <TreePine className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600">No hay árboles generados aún</p>
                <Button className="mt-3" asChild>
                  <Link to="/generate">Generar primer árbol</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Bibliografías Recientes
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/bibliography">Gestionar</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {bibliographiesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentBibliographies.length > 0 ? (
              <div className="space-y-4">
                {recentBibliographies.map((bibliography) => (
                  <div key={bibliography.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {bibliography.nombre_archivo}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(bibliography.fecha_subida)}
                      </p>
                    </div>
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600">No hay bibliografías subidas</p>
                <Button className="mt-3" asChild>
                  <Link to="/bibliography">Subir archivo</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

