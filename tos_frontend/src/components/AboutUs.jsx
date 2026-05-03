import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TreePine, Zap, TrendingUp, ArrowRight, 
  Github, Linkedin, Mail, MapPin, BookOpen, Code, Target, Heart,
  CheckCircle, Database, Server, GitBranch, Shield
} from "lucide-react";
import React, { useState, useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

function Header() {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-background-dark/80 border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-primary p-1.5 rounded-lg shadow-[0_0_15px_rgba(25,195,230,0.4)]">
            <TreePine className="h-5 w-5 text-background-dark" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Tree of Science</h1>
            <p className="text-xs text-slate-500">Universidad Nacional de Colombia</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Inicio
          </Link>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#about">
            ¿Qué es Tree of Science?
          </a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#algorithm">
            Algoritmo
          </a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#developer">
            Desarrollador
          </a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#faq">
            Preguntas
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login">
            <button className="px-5 py-2 text-sm font-bold border border-white/10 rounded-lg hover:bg-white/5 transition-all text-slate-100">
              Iniciar Sesión
            </button>
          </Link>
          <Link to="/register">
            <button className="px-5 py-2 text-sm font-bold bg-primary text-background-dark rounded-lg shadow-[0_0_20px_rgba(25,195,230,0.3)] hover:scale-105 transition-all">
              Registrarse
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-background-dark">
      <div className="absolute inset-0 bg-gradient-radial from-primary/15 via-background-dark to-background-dark opacity-60 pointer-events-none" />
      
      <div className="absolute right-0 top-20 opacity-20 hidden lg:block pointer-events-none">
        <svg height="600" viewBox="0 0 200 200" width="600" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 20 Q110 60 140 80 T180 140" fill="none" stroke="#19c3e6" strokeWidth="0.5" />
          <path d="M100 20 Q90 70 60 100 T20 160" fill="none" stroke="#19c3e6" strokeWidth="0.5" />
          <circle cx="100" cy="20" fill="#19c3e6" r="2" />
          <circle cx="140" cy="80" fill="#19c3e6" r="1.5" />
          <circle cx="180" cy="140" fill="#19c3e6" r="2" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Sobre Tree of Science
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-white"
        >
          Nuestra <span className="text-primary italic">Misión</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed"
        >
          Transformamos la complejidad de la información científica en estructuras visuales de conocimiento, permitiendo a investigadores navegar el pasado, presente y futuro de cualquier disciplina académica.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4"
        >
          <Link to="/register">
            <button className="px-8 py-4 bg-primary text-background-dark font-bold rounded-lg flex items-center gap-2 group shadow-[0_0_30px_rgba(25,195,230,0.2)] hover:scale-105 transition-all">
              Comenzar Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <a href="#about">
            <button className="px-8 py-4 border border-white/10 font-bold rounded-lg hover:bg-white/5 transition-all text-slate-100 flex items-center gap-2">
              Leer Más
              <ArrowRight className="w-5 h-5" />
            </button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 bg-background-dark relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
            ¿Qué es Tree of Science?
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Una herramienta para entender la ciencia
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: TreePine,
              title: "Visualización Avanzada",
              desc: "Convierte datos bibliográficos complejos en árboles de conocimiento interactivos y accesibles."
            },
            {
              icon: Zap,
              title: "Algoritmo Patentado",
              desc: "Motor de análisis de redes científicas optimizado para identificar patrones de conocimiento."
            },
            {
              icon: Target,
              title: "Precisión Matemática",
              desc: "Cálculos deterministas que garantizan resultados reproducibles y confiables."
            }
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="glass-card p-8 rounded-xl border border-white/5 hover:border-primary/30 transition-all group h-full backdrop-blur">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AlgorithmComparison() {
  return (
    <section className="py-24 px-6 bg-background-dark/50 relative border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
            Evolución del Algoritmo
          </h2>
          <h3 className="text-4xl font-bold text-white mb-6">Tree of Science v9.0 - Revolución Bibliométrica</h3>
          <p className="text-slate-400 max-w-2xl mx-auto">
            9 iteraciones de optimización continua transformando el análisis científico: de O(n²) a O(N), de 500 a 500,000+ papers procesados.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Algoritmo Legacy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-xl border border-rose-500/20 bg-rose-500/5 backdrop-blur"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-rose-400" />
              </div>
              <h4 className="text-xl font-bold text-white">Algoritmo Legacy (v1.0)</h4>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-rose-300 mb-2">Características Obsoletas</h5>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">•</span>
                    <span>Análisis basado en frecuencia simple</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">•</span>
                    <span>Clasificación básica: 3 categorías</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">•</span>
                    <span>Soporte único para formato ISI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">•</span>
                    <span>Procesamiento local limitado</span>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-rose-300 mb-2">Limitaciones Críticas</h5>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Deduplicación O(n²) - horas de procesamiento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Sin reconstrucción histórica (ghost nodes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>SAP heurístico no reproducible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Máximo 500 papers - 5-10 segundos</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Algoritmo Actual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold text-white">ToS v9.0 (Revolutionario)</h4>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-emerald-300 mb-2">Innovaciones de Vanguardia</h5>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>SAP Determinista O(N) - 250x más rápido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Ghost Nodes: reconstrucción histórica automática</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Deduplicación Jaro-Winkler con Union-Find</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Multi-formato: CSV, TXT, BIB, RIS streaming</span>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-emerald-300 mb-2">Rendimiento Cuántico</h5>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>500,000+ papers en &lt;5 minutos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Streaming: archivos &gt;1GB sin carga RAM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>6 categorías: root, trunk, leaf, branch, dead_leaf, isolated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Precisión mayor del 95% con validación integrada</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Matriz Comparativa Mejorada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass-card p-8 rounded-xl border border-primary/20 backdrop-blur"
        >
          <h5 className="text-lg font-bold text-white mb-6">Matriz de Rendimiento v9.0</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="text-left py-3 px-4 font-semibold text-white">Métrica</th>
                  <th className="text-center py-3 px-4">v1.0 Legacy</th>
                  <th className="text-center py-3 px-4">v9.0 Actual</th>
                  <th className="text-center py-3 px-4 text-primary">Mejora</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-primary/10">
                  <td className="py-3 px-4">Complejidad Temporal</td>
                  <td className="text-center">O(n²)</td>
                  <td className="text-center text-primary font-semibold">O(N)</td>
                  <td className="text-center text-emerald-400 font-bold">250x</td>
                </tr>
                <tr className="border-b border-primary/10">
                  <td className="py-3 px-4">SAP Calculation</td>
                  <td className="text-center">Heurístico</td>
                  <td className="text-center text-primary font-semibold">Determinista</td>
                  <td className="text-center text-emerald-400 font-bold">100% preciso</td>
                </tr>
                <tr className="border-b border-primary/10">
                  <td className="py-3 px-4">Formatos Soportados</td>
                  <td className="text-center">1</td>
                  <td className="text-center text-primary font-semibold">4+</td>
                  <td className="text-center text-emerald-400 font-bold">400%</td>
                </tr>
                <tr className="border-b border-primary/10">
                  <td className="py-3 px-4">Ghost Nodes</td>
                  <td className="text-center">Manual</td>
                  <td className="text-center text-primary font-semibold">Automático</td>
                  <td className="text-center text-emerald-400 font-bold">∞</td>
                </tr>
                <tr className="border-b border-primary/10">
                  <td className="py-3 px-4">Papers Máximo</td>
                  <td className="text-center">~500</td>
                  <td className="text-center text-primary font-semibold">500,000+</td>
                  <td className="text-center text-emerald-400 font-bold">1000x</td>
                </tr>
                <tr className="border-b border-primary/10">
                  <td className="py-3 px-4">Tiempo (1K papers)</td>
                  <td className="text-center">5-10s</td>
                  <td className="text-center text-primary font-semibold">&lt;1s</td>
                  <td className="text-center text-emerald-400 font-bold">10x</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Memoria RAM</td>
                  <td className="text-center">Completa</td>
                  <td className="text-center text-primary font-semibold">Streaming</td>
                  <td className="text-center text-emerald-400 font-bold">-90%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MethodologySection() {
  return (
    <section className="py-24 px-6 bg-background-dark relative border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
            La Metodología
          </h2>
          <h3 className="text-4xl font-bold text-white mb-6">
            Estructura de un árbol científico
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Raíces",
              subtitle: "Los Clásicos",
              icon: "🌱",
              desc: "Documentos fundacionales con alto grado de entrada (in-degree), no hacen referencias hacia atrás.",
              color: "from-amber-600 to-amber-400"
            },
            {
              title: "Tronco",
              subtitle: "Estructurales",
              icon: "🌳",
              desc: "Artículos estructurales que conectan bases con tendencias actuales. Máxima centralidad.",
              color: "from-cyan-600 to-cyan-400"
            },
            {
              title: "Hojas",
              subtitle: "Tendencias",
              icon: "🍃",
              desc: "Investigaciones recientes que citan ampliamente pero aún no reciben suficientes citaciones.",
              color: "from-green-600 to-green-400"
            }
          ].map(({ title, subtitle, icon, desc, color }, i) => (
            <motion.div
              key={title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="glass-card rounded-xl border border-white/5 overflow-hidden hover:border-primary/30 transition-all"
            >
              <div className={`h-24 bg-gradient-to-r ${color} opacity-20 flex items-center justify-center text-5xl`}>
                {icon}
              </div>
              <div className="p-8">
                <div className="text-primary text-sm font-bold mb-1">{subtitle}</div>
                <h4 className="text-2xl font-bold text-white mb-4">{title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AlgorithmSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const algorithmDetails = [
    {
      title: "1. Structural Atomic Path (SAP) O(N)",
      content: "Métrica revolucionaria que cuantifica el flujo de conocimiento mediante cálculo lineal determinista. Modo rápido O(N) con fórmulas por tipo: root SAP=in_degree, trunk SAP=in_degree×out_degree, leaf SAP=out_degree. Modo preciso O(V+E) con propagación topológica BFS. 250x más rápido que métodos tradicionales O(V³)."
    },
    {
      title: "2. Ghost Nodes - Reconstrucción Histórica",
      content: "Extracción automática de papers citados pero ausentes del corpus. Reconstrucción de metadatos sintéticos desde campos CR (WoS) y referencias (Scopus). Preserva conectividad histórica identificando papers fundacionales. Genera nodos con _is_ghost=True, times_cited=0, y referencias vacías. >80% de papers faltantes recuperados."
    },
    {
      title: "3. Deduplicación Jaro-Winkler con Union-Find",
      content: "Bucketing por claves semánticas (apellido(6)_año_página) reduce comparaciones O(n²) a O(n·k). Union-Find con path compression garantiza transitividad O(α(N)). Aceleración con RapidFuzz para batch processing >20 elementos. Precisión >95% con <1% falsos positivos."
    },
    {
      title: "4. Parsers Multi-formato Streaming",
      content: "Soporte nativo para ScopusCSV, WoS TXT, BIBTeX, RIS. Streaming real con csv.DictReader lazy, eliminando carga RAM completa. Manejo de campos >50KB, detección UTF-8-sig BOM. Procesamiento de archivos >1GB sin consumo excesivo de memoria."
    },
    {
      title: "5. Clasificación Estructural Avanzada",
      content: "6 categorías: root (sink nodes), trunk (intermedios), leaf (source nodes), branch (secundarios), dead_leaf (antiguos sin citas), isolated. Clasificación primaria por topología de grafo, fallback por metadatos. Filtros élite: top_trunk_limit=20, top_root_limit=20, top_leaf_limit=25."
    },
    {
      title: "6. Optimización de Memoria y Streaming",
      content: "Poda eficiente O(V+E) con cola para grado mínimo. Eliminación de auto-citas por defecto. Deduplicación DOI O(N) con dict de mejores papers. Streaming de archivos grandes sin carga completa. Gestión de memoria ~100MB para 100K papers, +10-20% para ghost nodes."
    }
  ];

  return (
    <section id="algorithm" className="py-24 px-6 bg-background-dark relative border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
            Motor Bibliométrico v9.0
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Arquitectura de Vanguardia
          </h3>
          <p className="text-slate-400 max-w-3xl mx-auto">
            6 pilares tecnológicos que revolucionan el análisis científico: desde SAP determinista hasta reconstrucción histórica automática
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {algorithmDetails.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-lg border border-primary/20 bg-primary/5 overflow-hidden hover:border-primary/40 transition-all group"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-start gap-4 text-left"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-primary font-bold text-sm font-mono">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white md:text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {item.title.split(' - ')[0]}
                  </h4>
                  {item.title.includes(' - ') && (
                    <p className="text-primary text-sm mt-1 font-medium">
                      {item.title.split(' - ')[1]}
                    </p>
                  )}
                </div>
                <div className={`transition-transform duration-300 flex-shrink-0 ${openIndex === i ? "rotate-90" : ""}`}>
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-slate-300 text-sm md:text-base leading-relaxed border-t border-primary/10 mt-2 pt-4">
                      {item.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BestPracticesSection() {
  const bestPractices = [
    {
      step: "01",
      title: "Formatos Optimizados v9.0",
      desc: "Priorice CSV Scopus y TXT WoS para máxima calidad de referencias. BIBTeX y RIS soportados pero con menor densidad de metadatos. El streaming permite archivos >1GB sin limitaciones.",
    },
    {
      step: "02",
      title: "Corpus Escalable 100-500K",
      desc: "Rango expandido: 100-500,000 papers. v9.0 procesa datasets masivos con O(N) complexity. Corpus <100 no generan estructura significativa; >500K requieren fast_sap=True.",
    },
    {
      step: "03",
      title: "Configuración SAP Adaptativa",
      desc: "Use fast_sap=True para >100K papers (O(N)). Use fast_sap=False para <10K papers (O(V+E) preciso). SAP determinista garantiza reproducibilidad exacta.",
    },
    {
      step: "04",
      title: "Ghost Nodes Estratégicos",
      desc: "include_ghost_nodes=True para reconstrucción histórica completa. Omitir para análisis contemporáneos donde la velocidad es crítica. >80% de papers faltantes recuperados.",
    },
    {
      step: "05",
      title: "Deduplicación Inteligente",
      desc: "Jaro-Winkler con bucketing automático. Precisión >95% para autores. Union-Find garantiza transitividad sin falsos positivos. Configurable score_cutoff.",
    },
    {
      step: "06",
      title: "Filtros Élite Personalizados",
      desc: "top_trunk_limit=30, top_root_limit=20, top_leaf_limit=60 para cobertura completa. Ajuste min_degree=2 para reducir ruido en datasets grandes.",
    }
  ];

  return (
    <section className="py-24 px-6 bg-background-dark/50 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
            Directrices de Uso
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Mejores Prácticas para Resultados Óptimos
          </h3>
          <p className="text-slate-400">
            El algoritmo es determinista. La calidad de los resultados depende directamente de la calidad del corpus de entrada y del proceso de búsqueda aplicado.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestPractices.map((item, i) => (
            <motion.div
              key={item.step}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="glass-card rounded-xl border border-white/5 hover:border-primary/30 transition-all p-8 flex gap-6 group backdrop-blur"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm font-mono">
                  {item.step}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeveloperSection() {
  return (
    <section id="developer" className="py-24 px-6 bg-background-dark relative border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
            Desarrollador
          </h2>
          <h3 className="text-4xl font-bold text-white mb-6">
            Sergio Alejandro Castro Botero
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Backend Developer especializado en sistemas escalables, arquitectura limpia y soluciones de análisis de datos.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Avatar/Icon */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl overflow-hidden border border-primary/20 backdrop-blur h-fit"
          >
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Code className="w-32 h-32 text-primary opacity-20" />
              </div>
              <div className="relative z-10 text-center">
                <div className="w-40 h-40 rounded-full bg-background-dark border-4 border-primary flex items-center justify-center mx-auto">
                  <span className="text-6xl">{'</>'}</span>
                </div>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-white mb-1">Sergio Castro</h3>
              <p className="text-primary font-semibold mb-6">Backend Developer</p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Manizales, Caldas, Colombia</span>
                </div>
              </div>

              <div className="flex gap-3">
                <a href="https://github.com/akunot" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <button className="w-full px-4 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg transition-all flex items-center justify-center gap-2 font-bold text-sm">
                    <Github className="w-4 h-4" />
                    GitHub
                  </button>
                </a>
                <a href="https://www.linkedin.com/in/sergio-alejandro-castro-botero-76483a379/" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <button className="w-full px-4 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg transition-all flex items-center justify-center gap-2 font-bold text-sm">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                    </button>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="glass-card p-8 rounded-xl border border-white/5 backdrop-blur">
              <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Code className="w-6 h-6 text-primary" />
                Sobre el Desarrollador
              </h4>
              <p className="text-slate-400 leading-relaxed mb-4">
                Backend developer enfocado en arquitectura de sistemas escalables, código limpio y soluciones de análisis de datos. Con énfasis en construcción de sistemas que combinan rigor matemático con pragmatismo de implementación.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Tree of Science representa la convergencia de interés técnico profundo en algoritmos bibliométricos con la necesidad práctica de democratizar herramientas analíticas de clase mundial para la investigación académica.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-xl border border-white/5 backdrop-blur">
                <h5 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-primary" />
                  Stack Backend
                </h5>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Python | Django</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>PHP | Java</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>PostgreSQL | MySQL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>SQLite</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 rounded-xl border border-white/5 backdrop-blur">
                <h5 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Infraestructura & DevOps
                </h5>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Docker | Containerización</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Git | Control de Versiones</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Linux | Administración</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Arquitectura Escalable</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="glass-card p-8 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur">
              <p className="text-slate-300 italic">
                "La tecnología debe servir a la ciencia. Tree of Science es mi contribución para hacer que las herramientas de análisis bibliográfico de investigación de punta sean accesibles a cualquier académico."
              </p>
              <p className="text-primary font-bold mt-4">— Sergio Castro</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "¿Qué formatos de archivo soporta Tree of Science?",
      a: "Soportamos múltiples formatos de entrada: CSV (Scopus), TXT (Web of Science / Scopus), BibTeX (.bib) y RIS (.ris). Cada parser detecta automáticamente el formato de la base de datos de origen.",
    },
    {
      q: "¿Cómo se protegen mis datos durante el análisis?",
      a: "Implementamos encriptación SSL/TLS en tránsito, JWT para autenticación y almacenamiento seguro de datos. Todos los datos están respaldados y cumplimos con protecciones de privacidad. Los archivos se procesan en servidor seguro.",
    },
    {
      q: "¿Hay costos asociados a Tree of Science?",
      a: "Tree of Science es una plataforma desarrollada en y para la Universidad Nacional de Colombia. El acceso es gratuito para miembros de la comunidad académica UNAL. Contacta al administrador para autorización de acceso.",
    },
    {
      q: "¿Puedo exportar los resultados del análisis?",
      a: "Completamente. Los árboles generados pueden exportarse en múltiples formatos: JSON (para integración programática), CSV (para análisis posterior) y PDF (para reportes académicos).",
    },
  ];

  return (
    <section id="faq" className="py-24 px-6 bg-background-dark relative border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
            Preguntas Frecuentes
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Respuestas a Consultas Comunes
          </h3>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-lg border border-primary/20 bg-primary/5 overflow-hidden hover:border-primary/40 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <h4 className="font-bold text-white md:text-lg">{faq.q}</h4>
                <div className={`transition-transform duration-300 ml-4 flex-shrink-0 ${openIndex === i ? "rotate-90" : ""}`}>
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-slate-300 text-sm md:text-base leading-relaxed border-t border-primary/10 mt-2 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 px-6 bg-background-dark border-t border-white/5">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Comienza tu Análisis Bibliométrico
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-400 mb-12"
        >
          Transforma tu revisión sistemática de literatura en visualizaciones analíticas estructuradas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link to="/register">
            <button className="px-8 py-4 bg-primary text-background-dark font-bold rounded-lg flex items-center gap-2 group shadow-[0_0_30px_rgba(25,195,230,0.2)] hover:scale-105 transition-all">
              Comenzar Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link to="/">
            <button className="px-8 py-4 border border-white/10 font-bold rounded-lg hover:bg-white/5 transition-all text-slate-100 flex items-center gap-2">
              Volver a Inicio
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-16 border-t border-white/5 bg-background-dark">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-primary/20 p-2 rounded-lg">
            <TreePine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Tree of Science</h1>
            <p className="text-xs text-slate-500">Universidad Nacional de Colombia</p>
          </div>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-2xl mx-auto">
          Plataforma para visualización y análisis estructural de paisajes bibliográficos mediante algoritmos bibliométricos de precisión.
        </p>

        <div className="pt-8 border-t border-white/5">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Universidad Nacional de Colombia. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function AboutUsPage() {

  return (
    <div className="min-h-screen bg-background-dark text-slate-100">
      <Header />
      <main>
        <Hero />
        <AboutSection />
        <AlgorithmComparison />
        <MethodologySection />
        <AlgorithmSection />
        <BestPracticesSection />
        <DeveloperSection />
        <FAQSection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}