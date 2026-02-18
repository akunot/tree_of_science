import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { treeAPI } from '../lib/api';
import {
  History,
  TreePine,
  Search,
  Eye,
  Download,
  Trash2,
  Calendar,
  FileText,
  FileJson,
  Sheet,
  FileDown,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const TreeHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrees, setSelectedTrees] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const queryClient = useQueryClient();

  // Debounce del término de búsqueda
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 700);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Consultar historial de árboles
  const { data, isLoading, error } = useQuery({
    queryKey: ['trees', page, pageSize, debouncedSearch],
    queryFn: () =>
      treeAPI
        .history({
          page,
          page_size: pageSize,
          search: debouncedSearch && debouncedSearch.length >= 2 ? debouncedSearch : undefined,
        })
        .then((res) => res.data),
    keepPreviousData: true,
  });

  const trees = data?.results || [];
  const totalTrees = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalTrees / pageSize));

  // Mutación para eliminar árbol
  const deleteMutation = useMutation({
    mutationFn: (id) => treeAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
      alert('Árbol eliminado exitosamente');
    },
    onError: () => {
      alert('Error al eliminar el árbol');
    },
  });

  // Descargar PDF
  const generatePDFFromTree = async (tree) => {
    try {
      const response = await treeAPI.download(tree.id, 'pdf');
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeTitle = String(tree.title || 'tree')
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
      link.href = url;
      link.download = `arbol-${safeTitle}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al descargar el PDF');
    }
  };

  // Descargar CSV
  const generateCSVFromTree = async (tree) => {
    try {
      let treeData = tree;
      if (!tree?.arbol_json?.nodes) {
        const response = await treeAPI.detail(tree.id);
        treeData = response.data;
      }

      const { nodes } = treeData.arbol_json;
      if (!nodes || nodes.length === 0) {
        alert('El árbol no tiene datos para exportar');
        return false;
      }

      const headers = [
        'ID', 'Título', 'Tipo', 'Grupo', 'Año', 'Autores', 'DOI',
        'PMID', 'arXiv', 'URL', 'Raíz', 'Tronco', 'Hoja', 'SAP', 'Citas'
      ];

      const rows = nodes.map(node => [
        node?.id || '',
        String(node?.label || '').replace(/"/g, '""').substring(0, 100),
        String(node?.type_label || '').replace(/"/g, '""'),
        node?.group || '',
        node?.year || '',
        Array.isArray(node?.authors) ? node.authors.join('; ') : String(node?.authors || ''),
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
          row.map(cell => {
            const cellString = String(cell || '');
            const needsQuotes = cellString.includes(',') || cellString.includes('"') || cellString.includes('\n');
            return needsQuotes ? `"${cellString.replace(/"/g, '""')}"` : cellString;
          }).join(',')
        ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arbol-${String(treeData.title || 'tree').replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al generar el CSV');
    }
  };

  // Descargar JSON
  const downloadJSON = async (tree) => {
    try {
      let treeData = tree;
      if (!tree?.arbol_json?.nodes) {
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
    } catch (error) {
      alert('Error al descargar el JSON');
    }
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el árbol "${title || `ID: ${id}`}"?`)) {
      deleteMutation.mutate(id);
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

  const toggleTreeSelection = (treeId) => {
    setSelectedTrees(prev =>
      prev.includes(treeId)
        ? prev.filter(id => id !== treeId)
        : [...prev, treeId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTrees.length === trees.length) {
      setSelectedTrees([]);
    } else {
      setSelectedTrees(trees.map(t => t.id));
    }
  };

  const handleDownloadConsolidated = () => {
    if (selectedTrees.length === 0) {
      alert('Selecciona al menos un árbol para descargar');
      return;
    }

    try {
      const treesToExport = trees.filter(t => selectedTrees.includes(t.id));

      const csvData = [
        ['ID', 'Título', 'Semilla', 'Bibliografía', 'Fecha', 'Nodos'],
        ...treesToExport.map(tree => [
          tree?.id || '',
          String(tree?.title || '').replace(/"/g, '""'),
          String(tree?.seed || '').replace(/"/g, '""'),
          String(tree?.bibliography_name || '').replace(/"/g, '""'),
          formatDate(tree?.fecha_generado),
          tree?.nodes_count ?? 0,
        ])
      ];

      const csvContent = csvData
        .map(row =>
          row.map(cell => {
            const cellString = String(cell || '');
            const needsQuotes = cellString.includes(',') || cellString.includes('"') || cellString.includes('\n');
            return needsQuotes ? `"${cellString.replace(/"/g, '""')}"` : cellString;
          }).join(',')
        ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arboles-consolidado-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSelectedTrees([]);
    } catch (error) {
      alert('Error al descargar los árboles');
    }
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-black text-[#f5f5f0] tracking-tight mb-3">
          Historial de Árboles
        </h1>
        <p className="text-[#f5f5f0]/60 text-sm md:text-base max-w-2xl mx-auto">
          Gestione, busque y exporte todos sus árboles de la ciencia generados
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
      >
        {[
          { label: 'Total de Árboles', value: totalTrees, icon: TreePine },
          { label: 'Este Mes', value: trees.filter(tree => {
            const treeDate = new Date(tree.fecha_generado);
            const now = new Date();
            return treeDate.getMonth() === now.getMonth() && treeDate.getFullYear() === now.getFullYear();
          }).length, icon: Calendar },
          { label: 'Con Bibliografía', value: trees.filter(tree => tree.bibliography_name).length, icon: FileText },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-xl border border-[#19c3e6]/20 transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 text-[#19c3e6]" />
              </div>
              <p className="text-[#f5f5f0]/60 text-xs font-medium mb-1">{stat.label}</p>
              <h4 className="text-4xl font-bold text-[#f5f5f0] tracking-tighter">{stat.value}</h4>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#f5f5f0]/40" />
          <input
            type="text"
            placeholder="Buscar árboles por título, semilla o bibliografía..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#19c3e6]/20 bg-[#19c3e6]/5 text-[#f5f5f0] placeholder-[#f5f5f0]/40 focus:border-[#19c3e6] focus:outline-none transition-all"
          />
        </div>
      </motion.div>

      {/* Trees List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#f5f5f0] tracking-tight">
            Árboles Generados ({trees.length}/{totalTrees})
          </h3>
          {trees.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={toggleSelectAll}
              className="text-xs font-bold text-[#19c3e6] px-3 py-2 hover:bg-[#19c3e6]/10 rounded-lg transition-colors"
            >
              {selectedTrees.length === trees.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
            </motion.button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl border border-[#19c3e6]/10 animate-pulse"
                style={{ background: "rgba(25, 195, 230, 0.03)" }}
              >
                <div className="h-4 bg-[#19c3e6]/20 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-[#19c3e6]/10 rounded w-1/4"></div>
              </motion.div>
            ))}
          </div>
        ) : trees.length === 0 ? (
          <div className="text-center py-12 text-[#f5f5f0]/60">
            <TreePine className="mx-auto h-12 w-12 text-[#19c3e6]/30 mb-3" />
            <p className="text-sm mb-3">
              {searchTerm ? 'No se encontraron árboles' : 'No hay árboles generados aún'}
            </p>
            {!searchTerm && (
              <Link to="/generate">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-[#19c3e6] text-[#1a2e05] font-bold rounded-lg text-sm inline-block"
                >
                  Generar Primer Árbol
                </motion.button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {trees.map((tree, idx) => (
              <motion.div
                key={tree.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                whileHover={{ x: 4 }}
                className={`p-4 rounded-xl border border-[#19c3e6]/10 flex items-center gap-4 group transition-all ${
                  selectedTrees.includes(tree.id) ? 'bg-[#19c3e6]/10' : ''
                }`}
                style={{
                  background: selectedTrees.includes(tree.id) ? 'rgba(25, 195, 230, 0.08)' : 'rgba(25, 195, 230, 0.03)',
                  backdropFilter: "blur(8px)"
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTrees.includes(tree.id)}
                  onChange={() => toggleTreeSelection(tree.id)}
                  className="w-5 h-5 rounded border-[#19c3e6]/30 text-[#19c3e6] cursor-pointer flex-shrink-0"
                />
                <div className="w-10 h-10 rounded-lg bg-[#19c3e6]/10 flex items-center justify-center text-[#19c3e6] border border-[#19c3e6]/20 flex-shrink-0">
                  <TreePine className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/tree/${tree.id}`} className="text-sm font-bold text-[#f5f5f0] hover:text-[#19c3e6] transition-colors truncate block">
                    {tree.title || `Árbol ${tree.id}`}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-[#f5f5f0]/50 flex-wrap">
                    <span>{formatDate(tree.fecha_generado)}</span>
                    <span>•</span>
                    <span>{tree.nodes_count || 0} nodos</span>
                    {tree.bibliography_name && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-[#19c3e6]/10 text-[#19c3e6]">{tree.bibliography_name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => generatePDFFromTree(tree)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-[#f5f5f0]/60 hover:text-red-500 transition-colors"
                    title="Descargar PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => generateCSVFromTree(tree)}
                    className="p-2 rounded-lg hover:bg-green-500/10 text-[#f5f5f0]/60 hover:text-green-500 transition-colors"
                    title="Descargar CSV"
                  >
                    <Sheet className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => downloadJSON(tree)}
                    className="p-2 rounded-lg hover:bg-blue-500/10 text-[#f5f5f0]/60 hover:text-blue-500 transition-colors"
                    title="Descargar JSON"
                  >
                    <FileJson className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleDelete(tree.id, tree.title)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-[#f5f5f0]/60 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-between items-center text-sm text-[#f5f5f0]/60"
        >
          <span>
            Página {page} de {totalPages} (total: {totalTrees})
          </span>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg border border-[#19c3e6]/20 hover:border-[#19c3e6] text-[#f5f5f0]/60 hover:text-[#19c3e6] transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-lg border border-[#19c3e6]/20 hover:border-[#19c3e6] text-[#f5f5f0]/60 hover:text-[#19c3e6] transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Action Bar */}
      {selectedTrees.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 rounded-lg border border-[#19c3e6]/20 flex items-center gap-4 z-40"
          style={{
            background: "rgba(15, 21, 19, 0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="w-8 h-8 rounded-full bg-[#19c3e6] flex items-center justify-center text-[#0f1513] text-xs font-bold">
            {selectedTrees.length}
          </div>
          <span className="text-sm font-medium text-[#f5f5f0]">
            {selectedTrees.length === 1 ? '1 árbol' : `${selectedTrees.length} árboles`} seleccionado{selectedTrees.length !== 1 ? 's' : ''}
          </span>
          <div className="h-6 w-px bg-[#19c3e6]/20"></div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleDownloadConsolidated}
            className="flex items-center gap-2 text-sm text-[#19c3e6] hover:text-[#19c3e6] font-bold uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            Descargar CSV
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default TreeHistory;