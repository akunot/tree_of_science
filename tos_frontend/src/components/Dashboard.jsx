import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { treeAPI, bibliographyAPI } from '../lib/api';
import { 
  TreePine, 
  Plus, 
  History, 
  BookOpen, 
  Calendar,
  Trash2,
  Eye,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Consultar historial de árboles (paginado)
  const { data: treesData, isLoading: treesLoading } = useQuery({
    queryKey: ['trees-dashboard'],
    queryFn: () =>
      treeAPI
        .history({
          page: 1,
          page_size: 10,
        })
        .then((res) => res.data),
  });

  // Consultar bibliografías
  const { data: bibliographies = [], isLoading: bibliographiesLoading } = useQuery({
    queryKey: ['bibliographies'],
    queryFn: () => bibliographyAPI.list().then(res => res.data),
  });

  const trees = treesData?.results || [];
  const recentTrees = trees.slice(0, 3);
  const recentBibliographies = bibliographies.slice(0, 3);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Función para eliminar árbol
  const handleDeleteTree = async (treeId, treeName) => {
    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el árbol "${treeName}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await treeAPI.delete(treeId);
      queryClient.invalidateQueries({ queryKey: ['trees-dashboard'] });
    } catch (error) {
      console.error('Error al eliminar árbol:', error);
      alert('Error al eliminar el árbol. Por favor, intente de nuevo.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Función para eliminar bibliografía
  const handleDeleteBibliography = async (bibId, bibName) => {
    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar la bibliografía "${bibName}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await bibliographyAPI.delete(bibId);
      queryClient.invalidateQueries({ queryKey: ['bibliographies'] });
    } catch (error) {
      console.error('Error al eliminar bibliografía:', error);
      alert('Error al eliminar la bibliografía. Por favor, intente de nuevo.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Stats calculadas
  const treesThisMonth = trees.filter(tree => {
    const treeDate = new Date(tree.fecha_generado);
    const now = new Date();
    return (
      treeDate.getMonth() === now.getMonth() &&
      treeDate.getFullYear() === now.getFullYear()
    );
  }).length;

  // Valores brutos
  const totalTrees = treesData?.count ?? trees.length;
  const totalBiblios = bibliographies.length;
  const totalThisMonth = treesThisMonth; // o podrías incluir bibliografías de este mes si quieres

  // Array de stats con valores
  const statValues = [totalTrees, totalBiblios, totalThisMonth];

  // Máximo para escalar las barras (evita división por 0)
  const maxStat = Math.max(...statValues, 1);

  // Función para obtener porcentaje (mínimo 10% si hay valor)
  const getBarWidth = (value) => {
    if (!value) return 5; // 0 → una rayita pequeña
    const pct = (value / maxStat) * 100;
    return Math.max(10, Math.min(pct, 100)); // entre 10% y 100%
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: "#0f1513",
      }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-black text-[#f5f5f0] tracking-tight mb-3">
          Bienvenido de vuelta, {user?.first_name}
        </h2>
        <p className="text-[#f5f5f0]/60 text-sm md:text-base max-w-2xl mx-auto">
          Tu ecosistema científico está evolucionando. Tienes{' '}
          <span className="text-[#19c3e6] font-bold">{treesData?.count ?? trees.length} árboles</span> y{' '}
          <span className="text-[#19c3e6] font-bold">{bibliographies.length} bibliografías</span> listos para síntesis.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex justify-center"
      >
        <Link to="/generate">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold rounded-lg uppercase tracking-widest text-sm transition-all"
            style={{
              boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
            }}
          >
            <Plus className="w-4 h-4" />
            Generar Nuevo Árbol
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center max-w-4xl mx-auto"
      >
        {[
          { label: 'Árboles Generados', value: totalTrees, icon: TreePine },
          { label: 'Bibliografías', value: totalBiblios, icon: BookOpen },
          { label: 'Este Mes', value: totalThisMonth, icon: Calendar },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-xl border border-[#19c3e6]/20 transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#19c3e6]/10 flex items-center justify-center text-[#19c3e6]">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[#f5f5f0]/60 text-xs font-medium mb-2">{stat.label}</p>
              <h4 className="text-4xl font-bold text-[#f5f5f0] tracking-tighter">{stat.value}</h4>
              <div className="mt-4 h-1 w-full bg-[#19c3e6]/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getBarWidth(stat.value)}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-full bg-[#19c3e6] shadow-[0_0_8px_#19c3e6]"
                ></motion.div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Grid - Centered */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
      >
        {/* Recent Trees */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-[#f5f5f0] flex items-center gap-2 tracking-tight">
              <History className="w-5 h-5 text-[#19c3e6]" />
              Árboles Recientes
            </h3>
            <Link to="/trees" className="text-[#19c3e6] text-xs font-bold hover:underline flex items-center gap-1">
              VER TODO <span>→</span>
            </Link>
          </div>

          <div className="space-y-3">
            {treesLoading ? (
              Array(3).fill(0).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl border border-[#19c3e6]/10 animate-pulse"
                  style={{ background: "rgba(25, 195, 230, 0.03)" }}
                >
                  <div className="h-4 bg-[#19c3e6]/20 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-[#19c3e6]/10 rounded w-1/2"></div>
                </motion.div>
              ))
            ) : recentTrees.length > 0 ? (
              recentTrees.map((tree, idx) => (
                <motion.div
                  key={tree.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="p-4 rounded-xl border border-[#19c3e6]/10 flex items-center gap-4 group transition-all"
                  style={{
                    background: "rgba(25, 195, 230, 0.03)",
                    backdropFilter: "blur(8px)"
                  }}
                >
                  <div className="w-12 h-12 rounded-lg bg-[#19c3e6]/10 flex items-center justify-center text-[#19c3e6] border border-[#19c3e6]/20 group-hover:bg-[#19c3e6] group-hover:text-[#1a2e05] transition-all flex-shrink-0">
                    <TreePine className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#f5f5f0] group-hover:text-[#19c3e6] transition-colors truncate">
                      {tree.title || `Árbol ${tree.id}`}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[#f5f5f0]/50 flex-wrap">
                      <span>{formatDate(tree.fecha_generado)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link to={`/tree/${tree.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-2 rounded-lg hover:bg-[#19c3e6]/10 text-[#f5f5f0]/60 hover:text-[#19c3e6] transition-colors"
                        title="Ver árbol"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleDeleteTree(tree.id, tree.title || `Árbol ${tree.id}`)}
                      disabled={deleteLoading}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[#f5f5f0]/60 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Eliminar árbol"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-[#f5f5f0]/60">
                <TreePine className="mx-auto h-12 w-12 text-[#19c3e6]/30 mb-3" />
                <p className="text-sm mb-3">No hay árboles generados aún</p>
                <Link to="/generate">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-[#19c3e6] text-[#1a2e05] font-bold rounded-lg text-sm inline-block"
                  >
                    Generar Primer Árbol
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bibliographies */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-[#f5f5f0] flex items-center gap-2 tracking-tight">
              <BookOpen className="w-5 h-5 text-[#19c3e6]" />
              Bibliografías
            </h3>
            <Link to="/bibliography" className="text-[#19c3e6] text-xs font-bold hover:underline flex items-center gap-1">
              GESTIONAR <span>→</span>
            </Link>
          </div>

          <div 
            className="rounded-xl border border-[#19c3e6]/10 divide-y divide-[#19c3e6]/5 overflow-hidden"
            style={{ background: "rgba(25, 195, 230, 0.02)" }}
          >
            {bibliographiesLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-3 bg-[#19c3e6]/20 rounded w-2/3 mb-2"></div>
                  <div className="h-2 bg-[#19c3e6]/10 rounded w-1/2"></div>
                </div>
              ))
            ) : recentBibliographies.length > 0 ? (
              recentBibliographies.map((bib, idx) => (
                <motion.div
                  key={bib.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="p-4 hover:bg-[#19c3e6]/5 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#f5f5f0] group-hover:text-[#19c3e6] transition-colors truncate">
                        {bib.nombre_archivo}
                      </h4>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-[#f5f5f0]/50 flex-wrap">
                        <span>{formatDate(bib.fecha_subida)}</span>
                        {bib.citations && <span>• {bib.citations} citas</span>}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleDeleteBibliography(bib.id, bib.nombre_archivo)}
                      disabled={deleteLoading}
                      className="p-1.5 rounded hover:bg-red-500/10 text-[#f5f5f0]/40 hover:text-red-500 transition-colors disabled:opacity-50 flex-shrink-0"
                      title="Eliminar bibliografía"
                    >
                      <Trash2 className="w-3 h-3" />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-6 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-[#19c3e6]/30 mb-2" />
                <p className="text-xs text-[#f5f5f0]/50 mb-3">No hay bibliografías aún</p>
                <Link to="/bibliography">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-[#19c3e6] text-[#1a2e05] font-bold rounded-lg text-sm inline-block"
                  >
                    Subir Primera
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center space-y-4 pt-8 border-t border-[#19c3e6]/10"
      >
        <p className="text-[9px] text-[#f5f5f0]/20 tracking-tighter">
          © {new Date().getFullYear()} Universidad Nacional de Colombia. Todos los derechos reservados.
        </p>
      </motion.footer>
      </div>
    </div>
  );
};

export default Dashboard;