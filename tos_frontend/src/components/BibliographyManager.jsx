import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
  Plus,
  MoreVertical,
} from 'lucide-react';

const BibliographyManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef();
  const queryClient = useQueryClient();

  // Consultar bibliografías
  const { data: bibliographies = [], isLoading, error } = useQuery({
    queryKey: ['bibliographies'],
    queryFn: () => bibliographyAPI.list().then(res => res.data),
  });

  // Mutación para subir archivo
  const uploadMutation = useMutation({
    mutationFn: (formData) => bibliographyAPI.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bibliographies'] });
      alert('Archivo subido exitosamente');
    },
    onError: (error) => {
      alert('Error al subir el archivo: ' + (error.response?.data?.archivo?.[0] || 'Intente nuevamente'));
    },
  });

  // Mutación para eliminar bibliografía
  const deleteMutation = useMutation({
    mutationFn: (id) => bibliographyAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bibliographies'] });
      alert('Bibliografía eliminada exitosamente');
    },
    onError: () => {
      alert('Error al eliminar la bibliografía. Intente nuevamente');
    },
  });

  // Mutación para descargar bibliografía
  const downloadMutation = useMutation({
    mutationFn: (id) => bibliographyAPI.download(id),
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
    },
    onError: () => {
      alert('Error al descargar el archivo');
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

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`¿Está seguro de que desea eliminar "${name}"?`);
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeleteLoading(false);
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

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'txt':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'csv':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Filtrar bibliografías por término de búsqueda
  const filteredBibliographies = bibliographies.filter(bibliography =>
    bibliography.nombre_archivo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bibThisMonth = bibliographies.filter(bib => {
    const bibDate = new Date(bib.fecha_subida);
    const now = new Date();
    return bibDate.getMonth() === now.getMonth() && 
           bibDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-black text-[#f5f5f0] tracking-tight mb-3">
          Gestor de Bibliografías
        </h1>
        <p className="text-[#f5f5f0]/60 text-sm md:text-base max-w-2xl mx-auto">
          Suba, gestione y descargue sus archivos de referencia académica
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
          { label: 'Total de Archivos', value: bibliographies.length, icon: BookOpen },
          { label: 'Este Mes', value: bibThisMonth, icon: Calendar },
          { label: 'Tipos', value: new Set(bibliographies.map(bib => bib.nombre_archivo.split('.').pop()?.toLowerCase())).size, icon: FileText },
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
            dragActive
              ? 'border-[#19c3e6] bg-[#19c3e6]/10'
              : 'border-[#19c3e6]/30 hover:border-[#19c3e6]/50'
          }`}
          style={{
            background: dragActive ? 'rgba(25, 195, 230, 0.05)' : 'rgba(25, 195, 230, 0.02)',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <motion.div
            animate={{ scale: dragActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Upload className="mx-auto h-16 w-16 text-[#19c3e6]/40 mb-4" />
          </motion.div>
          <h3 className="text-xl font-bold text-[#f5f5f0] mb-2 uppercase tracking-tight">
            Zona de Subida
          </h3>
          <p className="text-[#f5f5f0]/60 text-sm mb-6">
            Arrastra y suelta tus archivos o haz clic para seleccionar
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="px-6 py-3 bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-bold rounded-lg uppercase tracking-widest text-sm transition-all disabled:opacity-50"
            style={{
              boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
            }}
          >
            {uploadMutation.isPending ? 'Subiendo...' : 'Seleccionar Archivo'}
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
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

      {/* Bibliographies List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-bold text-[#f5f5f0] tracking-tight">
          Bibliografías ({filteredBibliographies.length})
        </h3>

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
        ) : filteredBibliographies.length === 0 ? (
          <div className="text-center py-12 text-[#f5f5f0]/60">
            <BookOpen className="mx-auto h-12 w-12 text-[#19c3e6]/30 mb-3" />
            <p className="text-sm mb-3">
              {searchTerm ? 'No se encontraron archivos' : 'No hay bibliografías subidas aún'}
            </p>
            {!searchTerm && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#19c3e6] text-[#1a2e05] font-bold rounded-lg text-sm inline-block"
              >
                Subir Primera Bibliografía
              </motion.button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBibliographies.map((bibliography, idx) => (
              <motion.div
                key={bibliography.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                whileHover={{ x: 4 }}
                className="p-4 rounded-xl border border-[#19c3e6]/10 flex items-center gap-4 group transition-all"
                style={{
                  background: "rgba(25, 195, 230, 0.03)",
                  backdropFilter: "blur(8px)"
                }}
              >
                <div className="w-12 h-12 rounded-lg bg-[#19c3e6]/10 flex items-center justify-center text-[#19c3e6] border border-[#19c3e6]/20 flex-shrink-0">
                  {getFileIcon(bibliography.nombre_archivo)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#f5f5f0] group-hover:text-[#19c3e6] transition-colors truncate">
                    {bibliography.nombre_archivo}
                  </h4>
                  <p className="text-xs text-[#f5f5f0]/50 mt-1">
                    {formatDate(bibliography.fecha_subida)}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleDownload(bibliography.id)}
                    disabled={downloadMutation.isPending}
                    className="p-2 rounded-lg hover:bg-[#19c3e6]/10 text-[#f5f5f0]/60 hover:text-[#19c3e6] transition-colors disabled:opacity-50"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleDelete(bibliography.id, bibliography.nombre_archivo)}
                    disabled={deleteLoading}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-[#f5f5f0]/60 hover:text-red-500 transition-colors disabled:opacity-50"
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
    </div>
  );
};

export default BibliographyManager;