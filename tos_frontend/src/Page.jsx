import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, TreePine, Users, Zap, TrendingUp, Share2, 
  ArrowRight, Download, Mail, FileText, BarChart3, AlertCircle
} from "lucide-react";
import React, { useState, useEffect } from "react";

const features = [
  {
    icon: BookOpen,
    title: "Gestión de Bibliografía",
    desc: "Suba y gestione sus archivos bibliográficos. Organice su investigación de manera eficiente en múltiples formatos.",
  },
  {
    icon: TreePine,
    title: "Generación de Árboles",
    desc: "Cree árboles de la ciencia a partir de sus datos bibliográficos utilizando semillas personalizadas y algoritmos inteligentes.",
  },
  {
    icon: BarChart3,
    title: "Visualización Interactiva",
    desc: "Explore sus árboles científicos con visualizaciones interactivas y herramientas avanzadas de análisis de datos.",
  },
  {
    icon: FileText,
    title: "Historial de Proyectos",
    desc: "Acceda al historial completo de árboles creados y continúe su trabajo desde donde lo dejó sin pérdida de datos.",
  },
  {
    icon: Download,
    title: "Exportación Múltiple",
    desc: "Descargue sus árboles en diversos formatos (JSON, CSV, PDF) para su uso en publicaciones académicas.",
  },
  {
    icon: Users,
    title: "Colaboración",
    desc: "Comparta sus árboles con colegas y colabore en proyectos de investigación científica de forma segura.",
  },
];

const steps = [
  {
    number: 1,
    title: "Registro y Autenticación",
    desc: "Cree su cuenta con su correo institucional. Autenticación segura con JWT para proteger sus datos académicos.",
  },
  {
    number: 2,
    title: "Carga de Bibliografía",
    desc: "Suba sus archivos en múltiples formatos (BibTeX, RIS, TXT, CSV). El sistema organiza automáticamente sus documentos.",
  },
  {
    number: 3,
    title: "Generación de Árboles",
    desc: "Ingrese una semilla y genere un árbol científico mostrando las relaciones entre conceptos y papers.",
  },
  {
    number: 4,
    title: "Análisis y Descarga",
    desc: "Analice visualizaciones interactivas y descargue resultados en diversos formatos para publicación.",
  },
];

const algorithmDetails = [
  {
    title: "1. Nuevo Motor Matemático (Cálculo SAP Lineal)",
    content: "En lugar de simular probabilidades como hacen las herramientas tradicionales, el algoritmo multiplica el grado de entrada por el de salida de cada artículo — un cálculo lineal O(N) que identifica con precisión matemática los verdaderos puentes de conocimiento en tu corpus."
  },
  {
    title: "2. Minería de Clásicos Ocultos (Ghost Nodes)",
    content: "El sistema no se limita a los artículos que subiste. Escanea la bibliografía interna de cada documento y extrae automáticamente los papers fundacionales que nunca descargaste — los que aparecen citados en todo el corpus pero no estaban en tu archivo original."
  },
  {
    title: "3. Poda Topológica y Aislamiento de Ruido",
    content: "El algoritmo extrae el Componente Conectado Más Grande del grafo y descarta los artículos aislados o sin conexiones relevantes. Lo que queda no es todo tu corpus — es la élite estructural de tu búsqueda."
  },
  {
    title: "4. Motor Dual Tolerante a Fallos",
    content: "Si el archivo viene con referencias incompletas o metadatos rotos, el sistema no colapsa. Activa un clasificador heurístico basado en años y conteo de citas para garantizar que siempre obtengas un resultado útil, independientemente de la calidad del insumo."
  }
];

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
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-primary p-1.5 rounded-lg shadow-[0_0_15px_rgba(25,195,230,0.4)]">
            <TreePine className="h-5 w-5 text-background-dark" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Tree of Science</h1>
            <p className="text-xs text-slate-500">Universidad Nacional de Colombia</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Características
          </a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#how-it-works">
            Cómo Funciona
          </a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#algorithm">
            Algoritmo
          </a>
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#best-practices">
            Buenas Prácticas
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
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/15 via-background-dark to-background-dark opacity-60 pointer-events-none" />

      {/* Abstract SVG Background */}
      <div className="absolute right-0 top-20 opacity-20 hidden lg:block pointer-events-none">
        <svg height="600" viewBox="0 0 200 200" width="600" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 20 Q110 60 140 80 T180 140" fill="none" stroke="#19c3e6" strokeWidth="0.5" />
          <path d="M100 20 Q90 70 60 100 T20 160" fill="none" stroke="#19c3e6" strokeWidth="0.5" />
          <path d="M100 80 Q130 110 120 180" fill="none" stroke="#19c3e6" strokeWidth="0.5" />
          <circle cx="100" cy="20" fill="#19c3e6" r="2" />
          <circle cx="140" cy="80" fill="#19c3e6" r="1.5" />
          <circle cx="180" cy="140" fill="#19c3e6" r="2" />
          <circle cx="60" cy="100" fill="#19c3e6" r="1.5" />
          <circle cx="20" cy="160" fill="#19c3e6" r="2" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left Column */}
        <div className="relative z-10">
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
            Plataforma de Investigación Científica
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-white"
          >
            Árboles de la <span className="text-primary italic">Ciencia</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed"
          >
            Plataforma para la visualización y análisis de relaciones científicas. Transforme sus datos bibliográficos en visualizaciones interactivas con precisión de laboratorio.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            <Link to="/register">
              <button className="px-8 py-4 bg-primary text-background-dark font-bold rounded-lg flex items-center gap-2 group shadow-[0_0_30px_rgba(25,195,230,0.2)] hover:scale-105 transition-all">
                Comenzar Ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/admin-request">
              <button className="px-8 py-4 border border-white/10 font-bold rounded-lg hover:bg-white/5 transition-all text-slate-100 flex items-center gap-2 group">
                Solicitar Acceso
                <AlertCircle className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Right Column - Image Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="glass-card rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-8 relative border border-white/5">
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
            <img
              alt="Visualización del árbol de ciencia generativo"
              className="w-full h-full object-contain relative z-10"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhOY6ZsP7NLhghd4jul_mV7hHJCwamT-D5xqlkj6_T-Q0mrY_zWjO4FCx9syaUzgOp0Tvqeb8wqQuZt0iqQcvCaO_qs01qRz1nlz9EZsehVRgxi-tUB-A0SmAvipAPMB3h6vSIlh88E-GhsBuRgLor0yrBokYpLzy8cAf-TlH8No5ka5Xm6P_pRrvV6Sj96hCVGK-o8kEX7EXOwzIrdd0hQUpGcsdt0lYiLZn8zqCRRy5RCxT5zoBku2p2f3zMJoaShFOFNZacxJ-a"
            />
            {/* Floating Data Points */}
            <div className="absolute top-10 left-10 glass-card p-3 rounded-lg border border-white/10 text-[10px] font-mono text-primary/80 backdrop-blur">
              ANÁLISIS: Activo<br />
              LATENCIA: 12ms
            </div>
            <div className="absolute bottom-12 right-8 glass-card p-3 rounded-lg border border-white/10 text-[10px] font-mono text-primary/80 backdrop-blur">
              CRECIMIENTO: +12.4%<br />
              CLUSTERING: Optimizado
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 bg-background-dark relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
            Características Principales
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Precisión científica, visualización avanzada
          </h3>
          <p className="text-slate-400">
            Nuestras herramientas avanzadas de laboratorio están diseñadas para exploración profunda de datos e intuición en descubrimiento de conocimiento académico.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
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

function HowItWorks() {
  const [cycle, setCycle] = React.useState(0);

  // Reinicia la animación cada 7 segundos aprox.
  React.useEffect(() => {
    const id = setInterval(() => {
      setCycle((c) => c + 1);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="how-it-works" className="py-24 bg-forest/20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
              Proceso de Investigación
            </h2>
            <h3 className="text-4xl font-bold text-white mb-8">Cómo Funciona</h3>
            <p className="text-slate-400 mb-12 max-w-md">
              Nuestra metodología está optimizada para el análisis sistemático, asegurando que tu investigación esté estructurada, documentada y lista para publicación.
            </p>

            <div className="space-y-12 relative">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-12"
                >
                  <div
                    className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 transition-all ${
                      i === 0
                        ? "bg-primary text-background-dark shadow-[0_0_15px_rgba(25,195,230,0.5)]"
                        : "bg-background-dark border border-white/10 text-slate-500"
                    }`}
                  >
                    {step.number}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-slate-400 text-sm">{step.desc}</p>

                  {/* Line connector */}
                  {i < steps.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-primary/50 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

           {/* Right Column - Mini animación: semilla → árbol */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 flex items-center justify-center"
          >
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-card p-4 border border-white/5 bg-background-dark/80">
              {/* Fondo suave */}
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-primary/10 pointer-events-none" />

              {/* SVG animado del árbol */}
              <motion.svg
                key={cycle}
                initial="hidden"
                animate="visible"
                viewBox="0 0 200 200"
                className="w-full h-full relative z-10"
              >
                <defs>
                  <linearGradient id="treeGradient" x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#19c3e6" />
                  </linearGradient>
                </defs>

                {/* Suelo */}
                <motion.line
                  x1="20"
                  y1="170"
                  x2="180"
                  y2="170"
                  stroke="#1e293b"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />

                {/* Semilla */}
                <motion.circle
                  cx="100"
                  cy="170"
                  r="5"
                  fill="#19c3e6"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                />

                {/* Tronco */}
                <motion.line
                  x1="100"
                  y1="170"
                  x2="100"
                  y2="80"
                  stroke="#38bdf8"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: 1,
                    // pequeño “bamboleo” muy sutil después de crecer
                    x: [0, -0.5, 0.5, 0],
                  }}
                  transition={{
                    pathLength: { duration: 1.2, delay: 0.7 },
                    opacity: { duration: 0.6, delay: 0.7 },
                    x: {
                      duration: 3,
                      delay: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    },
                  }}
                />

                {/* Ramas principales */}
                <motion.line
                  x1="100"
                  y1="120"
                  x2="60"
                  y2="90"
                  stroke="url(#treeGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 1.4 }}
                />
                <motion.line
                  x1="100"
                  y1="110"
                  x2="140"
                  y2="80"
                  stroke="url(#treeGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 1.6 }}
                />
                <motion.line
                  x1="100"
                  y1="95"
                  x2="80"
                  y2="60"
                  stroke="url(#treeGradient)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: 1.8 }}
                />
                <motion.line
                  x1="100"
                  y1="90"
                  x2="120"
                  y2="55"
                  stroke="url(#treeGradient)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: 2.0 }}
                />

                {/* Hojas / conceptos en las puntas */}
                {[
                  { cx: 60, cy: 90 },
                  { cx: 140, cy: 80 },
                  { cx: 80, cy: 60 },
                  { cx: 120, cy: 55 },
                  { cx: 100, cy: 80 },
                ].map((leaf, idx) => (
                  <motion.circle
                    key={idx}
                    cx={leaf.cx}
                    cy={leaf.cy}
                    r="4"
                    fill="#22c55e"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                    transition={{ duration: 0.5, delay: 2.2 + idx * 0.1 }}
                  />
                ))}

                {/* Partículas suaves alrededor del árbol */}
                {[
                  { cx: 40, cy: 110 },
                  { cx: 160, cy: 100 },
                  { cx: 130, cy: 50 },
                  { cx: 70, cy: 50 },
                ].map((p, idx) => (
                  <motion.circle
                    key={`p-${idx}`}
                    cx={p.cx}
                    cy={p.cy}
                    r="2"
                    fill="#38bdf8"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0.3], scale: [0, 1, 0.8] }}
                    transition={{
                      duration: 2,
                      delay: 2.5 + idx * 0.1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                ))}
              </motion.svg>

              {/* Texto explicativo abajo */}
              <div className="absolute bottom-4 left-4 right-4 text-[11px] text-slate-400 flex items-center justify-between">
                <span>De una semilla bibliográfica…</span>
                <span className="text-primary font-semibold">…a un árbol completo de conocimiento</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AlgorithmExplanation() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="algorithm" className="py-24 bg-background-dark relative border-t border-white/5 overflow-hidden">
      {/* Resplandor de fondo sutil (Background Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
            Innovación Tecnológica
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            El Algoritmo Tree of Science (v2.0)
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Hemos reconstruido el núcleo de nuestra plataforma desde cero. Nuestra nueva arquitectura abandona los cálculos tradicionales de teoría de redes en favor de un motor algorítmico propio, diseñado específicamente para la revisión sistemática de literatura.
          </p>
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

const bestPractices = [
  {
    step: "01",
    title: "La exportación lo es todo",
    desc: "CSV y TXT son los formatos recomendados — son los únicos que soportan Referencias Citadas, el insumo que el algoritmo necesita para construir conexiones reales. BibTeX y RIS funcionan, pero el sistema cae en modo heurístico: obtendrás un árbol, aunque menos preciso.",
  },
  {
    step: "02",
    title: "Entra con precisión, sal con claridad",
    desc: "Tu árbol será tan bueno como la búsqueda que lo originó. Afina tu ecuación con operadores booleanos (AND, OR, NOT) antes de exportar — un término de más puede llenar tu corpus de artículos irrelevantes.",
  },
  {
    step: "03",
    title: "El tamaño sí importa (en el buen sentido)",
    desc: "El punto óptimo está entre 100 y 2.000 artículos. Menos de 100 y el grafo queda sin estructura; más de 3.000 y empieza a diluirse. Si tu búsqueda arroja cifras muy grandes, refínala antes de proceder.",
  },
  {
    step: "04",
    title: "El árbol guía. Tú decides.",
    desc: "Lee primero las Raíces para entender los cimientos del campo, después los Troncos para ver cómo evolucionó, y termina con las Hojas para identificar las preguntas abiertas de hoy.",
  },
  {
    step: "05",
    title: "La ventana de tiempo lo cambia todo",
    desc: "Deja el año de inicio abierto para capturar las verdaderas Raíces históricas. Si acotaste la búsqueda a los últimos años, las Raíces serán los más citados de esa ventana — no los clásicos absolutos del campo.",
  },
];

function BestPractices() {
  return (
    <section
      id="best-practices"
      className="py-24 bg-forest/20 relative border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
            Buenas Prácticas
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Cómo obtener los mejores resultados
          </h3>
          <p className="text-slate-400">
            El algoritmo es determinista: resultados de calidad dependen de
            insumos de calidad. Estos cuatro principios marcan la diferencia
            entre un árbol revelador y uno con ruido.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
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
              {/* Step number */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm font-mono">
                  {item.step}
                </span>
              </div>

              {/* Content */}
              <div>
                <h4 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Card 05 — ancho completo */}
        <motion.div
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="glass-card rounded-xl border border-white/5 hover:border-primary/30 transition-all p-8 flex gap-6 group backdrop-blur mt-6"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm font-mono">05</span>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
              {bestPractices[4].title}
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              {bestPractices[4].desc}
            </p>
          </div>
        </motion.div>

        {/* Nota al pie sutil */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-slate-600 text-xs mt-12 max-w-xl mx-auto"
        >
          ¿Tu corpus no produce un árbol estructurado? Probablemente la
          exportación no incluye referencias citadas. Revisa el paso 01.
        </motion.p>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "¿Qué formatos de archivo soporta la plataforma?",
      a: "Soportamos múltiples formatos: BibTeX, RIS, TXT y CSV. Los archivos se convierten automáticamente a nuestro formato interno optimizado.",
    },
    {
      q: "¿Cómo se protegen mis datos?",
      a: "Utilizamos encriptación JWT, SSL/TLS y almacenamiento seguro. Todos los datos están respaldados y cumplen con GDPR.",
    },
    {
      q: "¿Cuál es el costo de la plataforma?",
      a: "La plataforma es gratuita para investigadores de la Universidad Nacional. Contacta al administrador para detalles.",
    },
    {
      q: "¿Puedo exportar mis resultados?",
      a: "Completamente. Exporta como JSON, CSV, o PDF listos para publicación académica.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-background-dark border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6">
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
            Respuestas a tus dudas
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
              /* Aplicamos los estilos visuales premium aquí */
              className="glass-card rounded-lg border border-primary/20 bg-primary/5 overflow-hidden hover:border-primary/40 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <h4 className="font-bold text-white md:text-lg">{faq.q}</h4>
                {/* Rotación suave de 90 grados para la flecha */}
                <div className={`transition-transform duration-300 ml-4 flex-shrink-0 ${openIndex === i ? "rotate-90" : ""}`}>
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </button>
              
              {/* Animación de Framer Motion para deslizar el contenido */}
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
  const [email, setEmail] = useState("");

  return (
    <section className="py-24 bg-background-dark border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Comienza tu Investigación Hoy
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-400 mb-12"
        >
          Únete a cientos de investigadores de la Universidad Nacional que transforman sus revisiones de literatura en visualizaciones científicas hermosas.
        </motion.p>

        {/* Botones de acción iguales a los del Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-wrap justify-center gap-4"
        >
          <Link to="/register">
            <button className="px-8 py-4 bg-primary text-background-dark font-bold rounded-lg flex items-center gap-2 group shadow-[0_0_30px_rgba(25,195,230,0.2)] hover:scale-105 transition-all">
              Comenzar Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link to="/admin-request">
            <button className="px-8 py-4 border border-white/10 font-bold rounded-lg hover:bg-white/5 transition-all text-slate-100 flex items-center gap-2 group">
              Solicitar Acceso
              <AlertCircle className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const [clicks, setClicks] = useState(0);

  const handleTreeClick = () => {
    setClicks(prev => prev + 1);
  };
  
  return (
    <footer className="py-16 border-t border-white/5 bg-background-dark">
      <div className="max-w-3xl mx-auto px-6 text-center">
        
        {/* Brand & Easter Egg */}
        <div className="flex flex-col items-center gap-3 mb-6 relative">
          <div 
            onClick={handleTreeClick}
            className="bg-primary/20 p-2 rounded-lg cursor-pointer hover:scale-110 transition-transform select-none"
            title="¿Qué pasa si haces clic?"
          >
            <TreePine className="w-5 h-5 text-primary" />
          </div>
          
          {/* El Easter Egg Animado */}
          <AnimatePresence>
            {clicks >= 7 && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-12 whitespace-nowrap bg-background-dark/90 border border-primary/30 text-primary px-3 py-1 rounded-full text-xs font-mono shadow-[0_0_15px_rgba(25,195,230,0.4)] z-10"
              >
                ✨ Hecho por Sergio Alejandro Castro Botero ✨
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Tree of Science</h1>
            <p className="text-xs text-slate-500">Universidad Nacional de Colombia</p>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Redefiniendo el panorama de revisiones de literatura a través del crecimiento orgánico y análisis de precisión.
        </p>

        {/* Contacto */}
        <div className="mb-8">
          <h5 className="font-bold text-white mb-3">Contacto</h5>
          <p className="text-sm text-slate-500 leading-relaxed">
            Email: soporte@unal.edu.co<br />
            Teléfono: +57 1 316 5000<br />
            Manizales, Colombia
          </p>
        </div>

        {/* Bottom / Copyright */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Universidad Nacional de Colombia. Todos los derechos reservados.
          </p>
        </div>
        
      </div>
    </footer>
  );
}

export default function LandingPage() {
  useEffect(() => {
    // Mensaje con estilos CSS en la consola
    console.log(
      "%c🌲 Tree of Science %c\n\nDesarrollado con ☕ y código limpio por Sergio Alejandro Castro Botero \nhttps://github.com/akunot",
      "color: #19c3e6; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px rgba(25,195,230,0.5);",
      "color: #94a3b8; font-size: 14px; font-family: monospace;"
    );
  }, []);
  return (
    <div className="min-h-screen bg-background-dark text-slate-100">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <AlgorithmExplanation />
        <BestPractices /> 
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}