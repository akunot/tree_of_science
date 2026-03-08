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
            Evolución Tecnológica
          </h2>
          <h3 className="text-4xl font-bold text-white mb-6">Algoritmo v1.0 vs Algoritmo v2.0</h3>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Una comparativa técnica de la evolución del motor bibliométrico a través de 8 iteraciones de mejora continua.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Algoritmo Antiguo */}
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
              <h4 className="text-xl font-bold text-white">Algoritmo v1.0</h4>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-rose-300 mb-2">Características</h5>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">•</span>
                    <span>Análisis de citaciones basado en frecuencia</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">•</span>
                    <span>Clasificación: Raíces, Tronco, Hojas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">•</span>
                    <span>Soporte básico para formatos ISI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">•</span>
                    <span>Interfaz limitada a análisis local</span>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-rose-300 mb-2">Limitaciones</h5>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Deduplicación manual de referencias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Sin extracción de nodos fantasma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Complejidad O(n²) en deduplicación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Máximo ~500 papers por análisis</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Algoritmo Nuevo */}
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
              <h4 className="text-xl font-bold text-white">Algoritmo v2.0 (Actual)</h4>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-emerald-300 mb-2">Mejoras Implementadas</h5>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Puntuación SAP determinista O(N)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Deduplicación Jaro-Winkler con bucketing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Extracción automática de ghost nodes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Soporte multi-formato: CSV, TXT, BIB, RIS</span>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-emerald-300 mb-2">Ventajas Técnicas</h5>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Complejidad O(n·k) con bucketing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Procesamiento streaming de archivos grandes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Filtros élite: minor_root, dead_leaf</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Análisis de 5000+ papers en &lt;5s</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Comparativa Detallada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass-card p-8 rounded-xl border border-primary/20 backdrop-blur"
        >
          <h5 className="text-lg font-bold text-white mb-6">Matriz Comparativa Técnica</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="text-left py-3 px-4 font-semibold text-white">Métrica</th>
                  <th className="text-center py-3 px-4">v1.0 (Antiguo)</th>
                  <th className="text-center py-3 px-4">v2.0 (Actual)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-primary/10">
                  <td className="py-3 px-4">Complejidad Dedup</td>
                  <td className="text-center">O(n²)</td>
                  <td className="text-center text-primary font-semibold">O(n·k)</td>
                </tr>
                <tr className="border-b border-primary/10">
                  <td className="py-3 px-4">SAP Score</td>
                  <td className="text-center">Heurístico</td>
                  <td className="text-center text-primary font-semibold">Determinista</td>
                </tr>
                <tr className="border-b border-primary/10">
                  <td className="py-3 px-4">Formatos Entrada</td>
                  <td className="text-center">1 (ISI)</td>
                  <td className="text-center text-primary font-semibold">4 (ISI, CSV, BIB, RIS)</td>
                </tr>
                <tr className="border-b border-primary/10">
                  <td className="py-3 px-4">Ghost Nodes</td>
                  <td className="text-center">Manual</td>
                  <td className="text-center text-primary font-semibold">Automático</td>
                </tr>
                <tr className="border-b border-primary/10">
                  <td className="py-3 px-4">Papers Máximo</td>
                  <td className="text-center">~500</td>
                  <td className="text-center text-primary font-semibold">5000+</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Tiempo Análisis (1000 papers)</td>
                  <td className="text-center">~5-10s</td>
                  <td className="text-center text-primary font-semibold">&lt;2s</td>
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
      title: "1. Puntuación SAP Determinista O(N)",
      content: "Cálculo lineal que multiplica el grado de entrada por salida de cada artículo. A diferencia de algoritmos probabilísticos tradicionales, garantiza resultados reproducibles y matemáticamente precisos."
    },
    {
      title: "2. Minería de Referencias Ocultas (Ghost Nodes)",
      content: "Extracción automática de metadatos de referencias bibliográficas no presentes en el corpus original. Preserva la conectividad histórica identificando papers fundacionales citados transversalmente."
    },
    {
      title: "3. Deduplicación Tipográfica Jaro-Winkler",
      content: "Fusión inteligente de variantes ortográficas mediante algoritmo Jaro-Winkler con bucketing apellido+año, reduciendo complejidad de O(n²) a O(n·k) sin sacrificar precisión."
    },
    {
      title: "4. Filtración por Componente Conectado",
      content: "Extracción del componente conectado más grande para aislar la élite estructural del corpus, eliminando nodos aislados y ruido topológico que no contribuye a patrones de conocimiento."
    }
  ];

  return (
    <section id="algorithm" className="py-24 px-6 bg-background-dark relative border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
            Especificaciones Técnicas
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            El Motor Bibliométrico
          </h3>
        </motion.div>

        <div className="space-y-4">
          {algorithmDetails.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-lg border border-primary/20 bg-primary/5 overflow-hidden hover:border-primary/40 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <h4 className="font-bold text-white md:text-lg">{item.title}</h4>
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
      title: "Calidad de las Referencias Bibliográficas",
      desc: "El algoritmo requiere que las referencias citadas (CR) estén completamente documentadas. Los formatos CSV y TXT ofrecen datos bibliográficos más completos que BIB o RIS.",
    },
    {
      step: "02",
      title: "Refinamiento de la Ecuación de Búsqueda",
      desc: "La precisión del árbol depende de la calidad de la búsqueda. Utilizar operadores booleanos (AND, OR, NOT) para acotar el corpus a términos específicos.",
    },
    {
      step: "03",
      title: "Optimización del Tamaño del Corpus",
      desc: "El rango óptimo es 100-2,000 artículos. Corpus menores no desarrollan estructura significativa; mayores a 3,000 pueden diluir patrones.",
    },
    {
      step: "04",
      title: "Interpretación Jerárquica del Árbol",
      desc: "Seguir una lectura estructurada: Raíces (fundamentos), Tronco (evolución), Hojas (frontera). Esta secuencia construye comprensión completa.",
    },
    {
      step: "05",
      title: "Consideración de Ventanas Temporales",
      desc: "El período de búsqueda modifica la estructura del árbol. Documentar siempre el rango temporal empleado para reproducibilidad.",
    },
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

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {bestPractices.slice(0, 4).map((item, i) => (
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

        {/* Card 05 - Full width */}
        <motion.div
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="glass-card rounded-xl border border-white/5 hover:border-primary/30 transition-all p-8 flex gap-6 group backdrop-blur"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm font-mono">
              {bestPractices[4].step}
            </span>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors">
              {bestPractices[4].title}
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              {bestPractices[4].desc}
            </p>
          </div>
        </motion.div>
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