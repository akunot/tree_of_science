import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { treeAPI } from '../lib/api';
import {
  History,
  TreePine,
  Search,
  Trash2,
  Calendar,
  FileText,
  FileJson,
  Sheet,
  FileDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
} from 'lucide-react';

// ── Modal de confirmación de borrado masivo ──────────────────────────────────
const ConfirmDeleteModal = ({ count, onConfirm, onCancel, isLoading }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="w-full max-w-md rounded-xl border border-red-500/20 p-6 space-y-5"
      style={{ background: 'rgba(15, 21, 19, 0.98)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#f5f5f0] mb-1">
            Eliminar {count} {count === 1 ? 'árbol' : 'árboles'}
          </h3>
          <p className="text-sm text-[#f5f5f0]/60">
            Esta acción no se puede deshacer. Los árboles seleccionados se eliminarán permanentemente.
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg border border-[#19c3e6]/20 text-sm text-[#f5f5f0]/70 hover:text-[#f5f5f0] hover:border-[#19c3e6]/40 transition-all disabled:opacity-50"
        >
          Cancelar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Eliminar
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

// ────────────────────────────────────────────────────────────────────────────
const TreeHistory = () => {
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedTrees, setSelectedTrees] = useState([]);
  const [page, setPage]                   = useState(1);
  const [pageSize]                        = useState(20);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting]   = useState(false);
  const queryClient = useQueryClient();

  // Debounce búsqueda
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 700);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ['trees', page, pageSize, debouncedSearch],
    queryFn: () =>
      treeAPI
        .history({
          page,
          page_size: pageSize,
          search: debouncedSearch.length >= 2 ? debouncedSearch : undefined,
        })
        .then((res) => res.data),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  const trees      = data?.results || [];
  const totalTrees = data?.count   || 0;
  const totalPages = Math.max(1, Math.ceil(totalTrees / pageSize));

  // Borrado individual
  const deleteMutation = useMutation({
    mutationFn: (id) => treeAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
    },
  });

  // Borrado masivo: secuencial con Promise.allSettled
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    await Promise.allSettled(selectedTrees.map((id) => treeAPI.delete(id)));
    setBulkDeleting(false);
    setShowDeleteModal(false);
    setSelectedTrees([]);
    queryClient.invalidateQueries({ queryKey: ['trees'] });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`¿Eliminar el árbol "${title || `ID: ${id}`}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Descargas individuales ──────────────────────────────────────────────────
  const generatePDFFromTree = async (tree) => {
    try {
      const response = await treeAPI.download(tree.id, 'pdf');
      const blob = new Blob([response.data], { type: 'application/pdf' });
      triggerDownload(blob, `arbol-${safeFileName(tree.title)}.pdf`);
    } catch {
      alert('Error al descargar el PDF');
    }
  };

  const generateCSVFromTree = async (tree) => {
    try {
      let treeData = tree;
      if (!tree?.arbol_json?.nodes) {
        const res = await treeAPI.detail(tree.id);
        treeData = res.data;
      }
      const nodes = treeData.arbol_json?.nodes || [];
      if (!nodes.length) { alert('El árbol no tiene datos para exportar'); return; }

      const headers = ['ID','Título','Tipo','Grupo','Año','Autores','DOI','PMID','arXiv','URL','Raíz','Tronco','Hoja','SAP','Citas'];
      const rows = nodes.map(n => [
        n?.id||'', esc(n?.label).substring(0,100), esc(n?.type_label),
        n?.group||'', n?.year||'',
        Array.isArray(n?.authors) ? n.authors.join('; ') : (n?.authors||''),
        n?.doi||'', n?.pmid||'', n?.arxiv_id||'', n?.url||'',
        n?.root||0, n?.trunk||0, n?.leaf||0, n?._sap||0, n?.times_cited||0,
      ]);

      const csv = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
      triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `arbol-${safeFileName(treeData.title)}.csv`);
    } catch {
      alert('Error al generar el CSV');
    }
  };

  const downloadJSON = async (tree) => {
    try {
      let treeData = tree;
      if (!tree?.arbol_json?.nodes) {
        const res = await treeAPI.detail(tree.id);
        treeData = res.data;
      }
      const exportData = {
        title: treeData.title, seed: treeData.seed,
        bibliography_name: treeData.bibliography_name,
        statistics: treeData.arbol_json?.statistics || {},
        generated_at: treeData.fecha_generado,
        total_nodes: (treeData.arbol_json?.nodes || []).length,
        nodes: treeData.arbol_json?.nodes || [],
      };
      triggerDownload(
        new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }),
        `arbol-${safeFileName(treeData.title)}.json`
      );
    } catch {
      alert('Error al descargar el JSON');
    }
  };

  // Helpers ────────────────────────────────────────────────────────────────
  const safeFileName = (title) =>
    `${String(title||'tree').replace(/[^a-z0-9]/gi,'_').toLowerCase()}-${new Date().toISOString().split('T')[0]}`;

  const esc     = (v) => String(v||'').replace(/"/g,'""');
  const csvCell = (c) => { const s = String(c||''); return /[,"\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };

  const triggerDownload = (blob, filename) => {
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('es-CO', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

  // Selección ───────────────────────────────────────────────────────────────
  const toggleTree      = (id) => setSelectedTrees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedTrees(selectedTrees.length === trees.length ? [] : trees.map(t => t.id));

  return (
    <div data-testid="history" className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">

      {/* Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <ConfirmDeleteModal
            count={selectedTrees.length}
            onConfirm={handleBulkDelete}
            onCancel={() => setShowDeleteModal(false)}
            isLoading={bulkDeleting}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-black text-[#f5f5f0] tracking-tight mb-3">
          Historial de Árboles
        </h1>
        <p className="text-[#f5f5f0]/60 text-sm md:text-base max-w-2xl mx-auto">
          Gestione, busque y exporte todos sus árboles de la ciencia generados
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
      >
        {[
          { label:'Total de Árboles', value: totalTrees, icon: TreePine },
          { label:'Este Mes', value: trees.filter(t => {
              const d = new Date(t.fecha_generado), n = new Date();
              return d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear();
            }).length, icon: Calendar },
          { label:'Con Bibliografía', value: trees.filter(t => t.bibliography_name).length, icon: FileText },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+idx*0.1 }}
              whileHover={{ y:-4 }}
              className="p-6 rounded-xl border border-[#19c3e6]/20 transition-all duration-300"
              style={{ background:"rgba(255,255,255,0.03)", backdropFilter:"blur(12px)" }}
            >
              <Icon className="w-5 h-5 text-[#19c3e6] mb-3" />
              <p className="text-[#f5f5f0]/60 text-xs font-medium mb-1">{stat.label}</p>
              <h4 className="text-4xl font-bold text-[#f5f5f0] tracking-tighter">{stat.value}</h4>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#f5f5f0]/40" />
          <input
            type="text"
            placeholder="Buscar por título, semilla o bibliografía..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#19c3e6]/20 bg-[#19c3e6]/5 text-[#f5f5f0] placeholder-[#f5f5f0]/40 focus:border-[#19c3e6] focus:outline-none transition-all"
          />
        </div>
      </motion.div>

      {/* Trees list */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#f5f5f0] tracking-tight">
            Árboles Generados ({trees.length}/{totalTrees})
          </h3>
          {trees.length > 0 && (
            <motion.button
              whileHover={{ scale:1.05 }}
              onClick={toggleSelectAll}
              className="text-xs font-bold text-[#19c3e6] px-3 py-2 hover:bg-[#19c3e6]/10 rounded-lg transition-colors"
            >
              {selectedTrees.length === trees.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </motion.button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_,i) => (
              <div key={i} className="p-4 rounded-xl border border-[#19c3e6]/10 animate-pulse" style={{ background:"rgba(25,195,230,0.03)" }}>
                <div className="h-4 bg-[#19c3e6]/20 rounded w-1/3 mb-2" />
                <div className="h-3 bg-[#19c3e6]/10 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : trees.length === 0 ? (
          <div className="text-center py-12 text-[#f5f5f0]/60">
            <TreePine className="mx-auto h-12 w-12 text-[#19c3e6]/30 mb-3" />
            <p className="text-sm mb-3">{searchTerm ? 'No se encontraron árboles' : 'No hay árboles generados aún'}</p>
            {!searchTerm && (
              <Link to="/generate">
                <motion.button whileHover={{ scale:1.05 }} className="px-4 py-2 bg-[#19c3e6] text-[#1a2e05] font-bold rounded-lg text-sm">
                  Generar primer árbol
                </motion.button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {trees.map((tree, idx) => {
              const selected = selectedTrees.includes(tree.id);
              return (
                <motion.div
                  key={tree.id}
                  initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3+idx*0.05 }}
                  whileHover={{ x:4 }}
                  className="p-4 rounded-xl border transition-all group flex items-center gap-4"
                  style={{
                    borderColor: selected ? 'rgba(25,195,230,0.35)' : 'rgba(25,195,230,0.1)',
                    background:  selected ? 'rgba(25,195,230,0.08)' : 'rgba(25,195,230,0.03)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleTree(tree.id)}
                    className="w-5 h-5 rounded border-[#19c3e6]/30 text-[#19c3e6] cursor-pointer flex-shrink-0 accent-[#19c3e6]"
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
                        <><span>•</span><span className="px-2 py-0.5 rounded bg-[#19c3e6]/10 text-[#19c3e6]">{tree.bibliography_name}</span></>
                      )}
                    </div>
                  </div>
                  {/* Acciones individuales */}
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button whileHover={{ scale:1.1 }} onClick={() => generatePDFFromTree(tree)}
                      className="p-2 rounded-lg hover:bg-orange-500/10 text-[#f5f5f0]/60 hover:text-orange-400 transition-colors" title="PDF">
                      <FileDown className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale:1.1 }} onClick={() => generateCSVFromTree(tree)}
                      className="p-2 rounded-lg hover:bg-green-500/10 text-[#f5f5f0]/60 hover:text-green-400 transition-colors" title="CSV">
                      <Sheet className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale:1.1 }} onClick={() => downloadJSON(tree)}
                      className="p-2 rounded-lg hover:bg-blue-500/10 text-[#f5f5f0]/60 hover:text-blue-400 transition-colors" title="JSON">
                      <FileJson className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale:1.1 }} onClick={() => handleDelete(tree.id, tree.title)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[#f5f5f0]/60 hover:text-red-500 transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Paginación */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          className="flex justify-between items-center text-sm text-[#f5f5f0]/60"
        >
          <span>Página {page} de {totalPages} (total: {totalTrees})</span>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale:1.05 }} disabled={page===1} onClick={() => setPage(p=>Math.max(1,p-1))}
              className="p-2 rounded-lg border border-[#19c3e6]/20 hover:border-[#19c3e6] text-[#f5f5f0]/60 hover:text-[#19c3e6] transition-colors disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale:1.05 }} disabled={page===totalPages} onClick={() => setPage(p=>Math.min(totalPages,p+1))}
              className="p-2 rounded-lg border border-[#19c3e6]/20 hover:border-[#19c3e6] text-[#f5f5f0]/60 hover:text-[#19c3e6] transition-colors disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Barra flotante de borrado masivo */}
      <AnimatePresence>
        {selectedTrees.length > 0 && (
          <motion.div
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl border border-[#19c3e6]/20 flex items-center gap-4 z-40 shadow-2xl"
            style={{ background:"rgba(15,21,19,0.97)", backdropFilter:"blur(16px)" }}
          >
            {/* Badge de cantidad */}
            <div className="w-7 h-7 rounded-full bg-[#19c3e6] flex items-center justify-center text-[#0f1513] text-xs font-black">
              {selectedTrees.length}
            </div>
            <span className="text-sm text-[#f5f5f0]/80">
              {selectedTrees.length === 1 ? '1 árbol seleccionado' : `${selectedTrees.length} árboles seleccionados`}
            </span>

            <div className="h-5 w-px bg-[#19c3e6]/20" />

            {/* Borrado masivo */}
            <motion.button
              whileHover={{ scale:1.05 }}
              whileTap={{ scale:0.95 }}
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-sm font-bold transition-all border border-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar seleccionados
            </motion.button>

            {/* Cerrar selección */}
            <motion.button
              whileHover={{ scale:1.1 }}
              whileTap={{ scale:0.95 }}
              onClick={() => setSelectedTrees([])}
              className="p-1.5 rounded-lg hover:bg-[#19c3e6]/10 text-[#f5f5f0]/40 hover:text-[#f5f5f0] transition-colors"
              title="Cancelar selección"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TreeHistory;