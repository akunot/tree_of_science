import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { treeAPI, bibliographyAPI } from '../lib/api';
import {
  TreePine,
  Sparkles,
  BookOpen,
  ArrowRight,
  Wand2,
  AlertCircle,
} from 'lucide-react';

const TreeGenerator = () => {
  const [formData, setFormData] = useState({
    seed: '',
    title: '',
    bibliography: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Consultar bibliografías disponibles
  const { data: bibliographies = [], isLoading: bibliographiesLoading } = useQuery({
    queryKey: ['bibliographies'],
    queryFn: () => bibliographyAPI.list().then(res => res.data),
  });

  const generateTreeMutation = useMutation({
    mutationFn: treeAPI.generate,
    onSuccess: (response) => {
      navigate(`/tree/${response.data.id}`);
    },
    onError: (error) => {
      setError(
        error.response?.data?.detail ||
        error.response?.data?.seed?.[0] ||
        'Error al generar el árbol. Intente nuevamente.'
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.seed.trim()) {
      setError('La semilla es requerida');
      return;
    }

    const payload = {
      seed: formData.seed,
      title: formData.title || undefined,
      bibliography: formData.bibliography || undefined,
    };

    generateTreeMutation.mutate(payload);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleBibliographyChange = (value) => {
    setFormData({
      ...formData,
      bibliography: value === 'none' ? '' : value,
    });
  };

  const seedExamples = [
    "Inteligencia artificial en medicina",
    "Cambio climático y biodiversidad",
    "Computación cuántica aplicaciones",
    "Neurociencia cognitiva",
    "Energías renovables sostenibles"
  ];

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-black text-[#f5f5f0] tracking-tight mb-3">
          Generar Árbol de la Ciencia
        </h1>
        <p className="text-[#f5f5f0]/60 text-sm md:text-base max-w-2xl mx-auto">
          Cree un árbol de conocimiento estructurado a partir de una semilla conceptual
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-red-500/20 bg-red-500/10 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Semilla */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-3"
            >
              <label className="block text-sm font-bold text-[#f5f5f0] uppercase tracking-widest">
                Semilla Conceptual *
              </label>
              <textarea
                name="seed"
                placeholder="Ingrese el concepto o tema principal para generar el árbol..."
                value={formData.seed}
                onChange={handleChange}
                className="w-full min-h-[120px] p-4 rounded-lg border border-[#19c3e6]/20 bg-[#19c3e6]/5 text-[#f5f5f0] placeholder-[#f5f5f0]/40 focus:border-[#19c3e6] focus:outline-none transition-all resize-none"
                required
              />
              <p className="text-xs text-[#f5f5f0]/60">
                Describa el tema o concepto principal que desea explorar
              </p>
            </motion.div>

            {/* Título opcional */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <label className="block text-sm font-bold text-[#f5f5f0] uppercase tracking-widest">
                Título del Árbol *
              </label>
              <input
                type="text"
                name="title"
                placeholder="Ej: Investigación en IA Médica"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#19c3e6]/20 bg-[#19c3e6]/5 text-[#f5f5f0] placeholder-[#f5f5f0]/40 focus:border-[#19c3e6] focus:outline-none transition-all"
              />
              <p className="text-xs text-[#f5f5f0]/60">
                Asigne un nombre descriptivo a su árbol
              </p>
            </motion.div>

            {/* Selección de bibliografía */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-3"
            >
              <label className="block text-sm font-bold text-[#f5f5f0] uppercase tracking-widest">
                Bibliografía de Referencia *
              </label>
              <select
                value={formData.bibliography || 'none'}
                onChange={(e) => handleBibliographyChange(e.target.value)}
                disabled={bibliographiesLoading}
                className="w-full px-4 py-3 rounded-lg border border-[#19c3e6]/20 bg-[#19c3e6]/5 text-[#f5f5f0] focus:border-[#19c3e6] focus:outline-none transition-all disabled:opacity-50"
              >
                <option value="none" className="bg-[#0f1513]">Sin bibliografía</option>
                {bibliographies.map((bibliography) => (
                  <option key={bibliography.id} value={bibliography.id.toString()} className="bg-[#0f1513]">
                    {bibliography.nombre_archivo}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#f5f5f0]/60">
                Seleccione un archivo de referencia para enriquecer el árbol
              </p>
            </motion.div>

            {/* Botón de generación */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={generateTreeMutation.isPending}
                className="w-full px-6 py-4 bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-black rounded-lg uppercase tracking-widest text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  boxShadow: "0 0 20px rgba(25, 195, 230, 0.3)"
                }}
              >
                {generateTreeMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1a2e05]"></div>
                    Generando árbol...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generar Árbol de la Ciencia
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Panel lateral */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Ejemplos de semillas */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-bold text-[#f5f5f0] uppercase tracking-widest">
              Ejemplos de Semillas
            </h3>
            <p className="text-xs text-[#f5f5f0]/60">Ideas para comenzar su investigación</p>
            <div className="space-y-2">
              {seedExamples.map((example, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02, x: 4 }}
                  type="button"
                  onClick={() => setFormData({ ...formData, seed: example })}
                  className="w-full text-left p-3 rounded-lg border border-[#19c3e6]/20 hover:border-[#19c3e6] bg-[#19c3e6]/5 hover:bg-[#19c3e6]/10 transition-all text-xs text-[#f5f5f0]/80 hover:text-[#f5f5f0]"
                >
                  {example}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Información sobre bibliografías */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-4 rounded-xl border border-[#19c3e6]/20"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-[#19c3e6]" />
              <h4 className="text-sm font-bold text-[#f5f5f0] uppercase tracking-widest">
                Bibliografías
              </h4>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-[#f5f5f0]/60">
                Tiene <span className="text-[#19c3e6] font-bold">{bibliographies.length}</span> bibliografías disponibles
              </p>
              {bibliographies.length === 0 && (
                <div className="text-center py-4">
                  <BookOpen className="mx-auto h-8 w-8 text-[#19c3e6]/30 mb-2" />
                  <p className="text-xs text-[#f5f5f0]/60 mb-3">
                    No hay bibliografías subidas
                  </p>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    href="/bibliography"
                    className="inline-block px-4 py-2 bg-[#19c3e6] text-[#1a2e05] font-bold rounded-lg text-xs uppercase tracking-widest"
                  >
                    Subir archivo
                  </motion.a>
                </div>
              )}
            </div>
          </motion.div>

          {/* Información del proceso */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl border border-[#19c3e6]/20"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#19c3e6]" />
              <h4 className="text-sm font-bold text-[#f5f5f0] uppercase tracking-widest">
                ¿Cómo funciona?
              </h4>
            </div>
            <div className="space-y-3">
              {[
                'Ingrese una semilla conceptual que represente su tema de investigación',
                'Opcionalmente, seleccione una bibliografía de referencia',
                'El sistema generará un árbol de conocimiento estructurado'
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + idx * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-[#19c3e6] text-[#1a2e05] flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-[#f5f5f0]/70 mt-0.5">{step}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-4 rounded-xl border border-[#19c3e6]/20"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(12px)",
            }}
          >
            <h4 className="text-sm font-bold text-[#f5f5f0] uppercase tracking-widest mb-3">
              💡 Consejos
            </h4>
            <ul className="space-y-2 text-xs text-[#f5f5f0]/70">
              <li className="flex items-start gap-2">
                <span className="text-[#19c3e6] font-bold">•</span>
                <span>Sea específico en su semilla para mejores resultados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#19c3e6] font-bold">•</span>
                <span>Use bibliografías para enriquecer el árbol</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TreeGenerator;