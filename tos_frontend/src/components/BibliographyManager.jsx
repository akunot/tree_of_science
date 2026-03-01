import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { bibliographyAPI } from '../lib/api';
import {
  BookOpen,
  Upload,
  Search,
  Download,
  Trash2,
  Calendar,
  FileText,
  File,
  AlertTriangle,
  X,
} from 'lucide-react';

// ── Iconos por extensión ─────────────────────────────────────────────────────
const FILE_TYPES = {
  pdf:  { bg: 'bg-red-500/15',    border: 'border-red-500/30',    text: 'text-red-400',    label: 'PDF'  },
  csv:  { bg: 'bg-green-500/15',  border: 'border-green-500/30',  text: 'text-green-400',  label: 'CSV'  },
  txt:  { bg: 'bg-slate-500/15',  border: 'border-slate-400/30',  text: 'text-slate-400',  label: 'TXT'  },
  ris:  { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-400', label: 'RIS'  },
  bib:  { bg: 'bg-amber-500/15',  border: 'border-amber-500/30',  text: 'text-amber-400',  label: 'BIB'  },
};

const FileIcon = ({ filename }) => {
  const ext = filename?.split('.').pop()?.toLowerCase() || '';
  const style = FILE_TYPES[ext] || { bg: 'bg-[#19c3e6]/10', border: 'border-[#19c3e6]/20', text: 'text-[#19c3e6]/70', label: ext.toUpperCase() || '?' };
  return (
    <div className={`w-12 h-12 rounded-lg ${style.bg} border ${style.border} flex flex-col items-center justify-center gap-0.5 flex-shrink-0`}>
      <FileText className={`w-4 h-4 ${style.text}`} />
      <span className={`text-[9px] font-black uppercase tracking-wider ${style.text}`}>{style.label}</span>
    </div>
  );
};

// ── Modal confirmación borrado masivo ────────────────────────────────────────
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
            Eliminar {count} {count === 1 ? 'bibliografía' : 'bibliografías'}
          </h3>
          <p className="text-sm text-[#f5f5f0]/60">
            Esta acción no se puede deshacer. Los archivos seleccionados se eliminarán permanentemente.
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onCancel} disabled={isLoading}
          className="px-4 py-2 rounded-lg border border-[#19c3e6]/20 text-sm text-[#f5f5f0]/70 hover:text-[#f5f5f0] hover:border-[#19c3e6]/40 transition-all disabled:opacity-50"
        >
          Cancelar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onConfirm} disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Trash2 className="w-4 h-4" />}
          Eliminar
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Componente principal ─────────────────────────────────────────────────────
const BibliographyManager = () => {
  const [searchTerm, setSearchTerm]         = useState('');
  const [dragActive, setDragActive]         = useState(false);
  const [selected, setSelected]             = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting]     = useState(false);
  const fileInputRef = useRef();
  const queryClient  = useQueryClient();

  const { data: bibliographies = [], isLoading } = useQuery({
    queryKey: ['bibliographies'],
    queryFn: () => bibliographyAPI.list().then(res => res.data),
  });

  // Upload
  const uploadMutation = useMutation({
    mutationFn: (formData) => bibliographyAPI.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bibliographies'] });
      alert('Archivo subido exitosamente');
    },
    onError: (error) => {
      const raw = error.response?.data?.archivo?.[0] || error.response?.data?.detail || error.response?.data?.error || '';
      const msg = String(raw || '');
      let friendly = msg || 'Error al subir el archivo. Intente nuevamente.';
      if (msg.includes('no tiene suficientes datos de citación')) {
        friendly = 'El archivo se subió pero no tiene suficientes datos de citación.\n\nDesde Scopus, exporte en formato RIS o BibTeX marcando también la opción "References".';
      }
      alert('Error: ' + friendly);
    },
  });

  // Delete individual
  const deleteMutation = useMutation({
    mutationFn: (id) => bibliographyAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bibliographies'] }),
    onError: () => alert('Error al eliminar la bibliografía.'),
  });

  // Download
  const downloadMutation = useMutation({
    mutationFn: (id) => bibliographyAPI.download(id),
    onSuccess: (response, id) => {
      const bib = bibliographies.find(b => b.id === id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a   = document.createElement('a');
      a.href = url;
      a.setAttribute('download', bib?.nombre_archivo || `bibliografia_${id}`);
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: () => alert('Error al descargar el archivo'),
  });

  // Borrado masivo
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    await Promise.allSettled(selected.map(id => bibliographyAPI.delete(id)));
    setBulkDeleting(false);
    setShowDeleteModal(false);
    setSelected([]);
    queryClient.invalidateQueries({ queryKey: ['bibliographies'] });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Eliminar "${name}"?`)) deleteMutation.mutate(id);
  };

  const handleFileUpload = (files) => {
    if (!files?.length) return;
    const file = files[0];
    const fd   = new FormData();
    fd.append('archivo', file);
    fd.append('nombre_archivo', file.name);
    uploadMutation.mutate(fd);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('es-CO', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

  // Selección
  const toggleItem      = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleSelectAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(b => b.id));

  const filtered = bibliographies.filter(b =>
    b.nombre_archivo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bibThisMonth = bibliographies.filter(b => {
    const d = new Date(b.fecha_subida), n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  const uniqueTypes = new Set(bibliographies.map(b => b.nombre_archivo.split('.').pop()?.toLowerCase())).size;

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">

      <AnimatePresence>
        {showDeleteModal && (
          <ConfirmDeleteModal
            count={selected.length}
            onConfirm={handleBulkDelete}
            onCancel={() => setShowDeleteModal(false)}
            isLoading={bulkDeleting}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center">
        <h1 className="text-3xl md:text-4xl font-black text-[#f5f5f0] tracking-tight mb-3">
          Gestor de Bibliografías
        </h1>
        <p className="text-[#f5f5f0]/60 text-sm md:text-base max-w-2xl mx-auto">
          Suba, gestione y descargue sus archivos de referencia académica
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
      >
        {[
          { label:'Total de Archivos', value: bibliographies.length, icon: BookOpen },
          { label:'Este Mes',          value: bibThisMonth,          icon: Calendar  },
          { label:'Tipos',             value: uniqueTypes,           icon: FileText  },
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
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 text-[#19c3e6]" />
                <span className="text-[10px] font-bold text-[#19c3e6] px-2 py-1 bg-[#19c3e6]/10 rounded uppercase">
                  {stat.label}
                </span>
              </div>
              <h4 className="text-4xl font-bold text-[#f5f5f0] tracking-tighter">{stat.value}</h4>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Upload Zone */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
            dragActive ? 'border-[#19c3e6] bg-[#19c3e6]/10' : 'border-[#19c3e6]/30 hover:border-[#19c3e6]/50'
          }`}
          style={{ background: dragActive ? 'rgba(25,195,230,0.05)' : 'rgba(25,195,230,0.02)' }}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        >
          <motion.div animate={{ scale: dragActive ? 1.1 : 1 }} transition={{ duration: 0.2 }}>
            <Upload className="mx-auto h-16 w-16 text-[#19c3e6]/40 mb-4" />
          </motion.div>
          <h3 className="text-xl font-bold text-[#f5f5f0] mb-2 uppercase tracking-tight">Zona de Subida</h3>
          <p className="text-[#f5f5f0]/60 text-sm mb-2">Arrastra y suelta tus archivos o haz clic para seleccionar</p>

          {/* Formatos aceptados */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {Object.entries(FILE_TYPES).map(([ext, s]) => (
              <span key={ext} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.bg} ${s.text} border ${s.border}`}>
                .{ext}
              </span>
            ))}
          </div>

          <motion.button
            whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="px-6 py-3 bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold rounded-lg uppercase tracking-widest text-sm transition-all disabled:opacity-50"
            style={{ boxShadow:"0 0 20px rgba(25,195,230,0.3)" }}
          >
            {uploadMutation.isPending ? 'Subiendo...' : 'Seleccionar Archivo'}
          </motion.button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#f5f5f0]/40" />
          <input
            type="text"
            placeholder="Buscar archivos de bibliografía..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#19c3e6]/20 bg-[#19c3e6]/5 text-[#f5f5f0] placeholder-[#f5f5f0]/40 focus:border-[#19c3e6] focus:outline-none transition-all"
          />
        </div>
      </motion.div>

      {/* List */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#f5f5f0] tracking-tight">
            Bibliografías ({filtered.length})
          </h3>
          {filtered.length > 0 && (
            <motion.button
              whileHover={{ scale:1.05 }} onClick={toggleSelectAll}
              className="text-xs font-bold text-[#19c3e6] px-3 py-2 hover:bg-[#19c3e6]/10 rounded-lg transition-colors"
            >
              {selected.length === filtered.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[#f5f5f0]/60">
            <BookOpen className="mx-auto h-12 w-12 text-[#19c3e6]/30 mb-3" />
            <p className="text-sm mb-3">{searchTerm ? 'No se encontraron archivos' : 'No hay bibliografías subidas aún'}</p>
            {!searchTerm && (
              <motion.button whileHover={{ scale:1.05 }} onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#19c3e6] text-[#1a2e05] font-bold rounded-lg text-sm">
                Subir primera bibliografía
              </motion.button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((bib, idx) => {
              const isSelected = selected.includes(bib.id);
              return (
                <motion.div
                  key={bib.id}
                  initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4+idx*0.05 }}
                  whileHover={{ x:4 }}
                  className="p-4 rounded-xl border transition-all group flex items-center gap-4"
                  style={{
                    borderColor: isSelected ? 'rgba(25,195,230,0.35)' : 'rgba(25,195,230,0.1)',
                    background:  isSelected ? 'rgba(25,195,230,0.08)' : 'rgba(25,195,230,0.03)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItem(bib.id)}
                    className="w-5 h-5 rounded cursor-pointer flex-shrink-0 accent-[#19c3e6]"
                  />
                  <FileIcon filename={bib.nombre_archivo} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#f5f5f0] group-hover:text-[#19c3e6] transition-colors truncate">
                      {bib.nombre_archivo}
                    </h4>
                    <p className="text-xs text-[#f5f5f0]/50 mt-1">{formatDate(bib.fecha_subida)}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale:1.1 }}
                      onClick={() => downloadMutation.mutate(bib.id)}
                      disabled={downloadMutation.isPending}
                      className="p-2 rounded-lg hover:bg-[#19c3e6]/10 text-[#f5f5f0]/60 hover:text-[#19c3e6] transition-colors disabled:opacity-50"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale:1.1 }}
                      onClick={() => handleDelete(bib.id, bib.nombre_archivo)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[#f5f5f0]/60 hover:text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Barra flotante de borrado masivo */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl border border-[#19c3e6]/20 flex items-center gap-4 z-40 shadow-2xl"
            style={{ background:"rgba(15,21,19,0.97)", backdropFilter:"blur(16px)" }}
          >
            <div className="w-7 h-7 rounded-full bg-[#19c3e6] flex items-center justify-center text-[#0f1513] text-xs font-black">
              {selected.length}
            </div>
            <span className="text-sm text-[#f5f5f0]/80">
              {selected.length === 1 ? '1 bibliografía seleccionada' : `${selected.length} bibliografías seleccionadas`}
            </span>
            <div className="h-5 w-px bg-[#19c3e6]/20" />
            <motion.button
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-sm font-bold transition-all border border-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar seleccionadas
            </motion.button>
            <motion.button
              whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}
              onClick={() => setSelected([])}
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

export default BibliographyManager;