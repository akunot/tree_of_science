import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, TreePine, Users, Zap, TrendingUp, Share2, 
  ArrowRight, Download, Mail, FileText, BarChart3, AlertCircle,
  CheckCircle, Lightbulb, Code, Gauge, Award
} from "lucide-react";
import React, { useState, useEffect } from "react";

const features = [
  {
    icon: BookOpen,
    title: "Gestión de Bibliografía",
    desc: "Suba y gestione sus archivos bibliográficos. Organice su investigación de manera eficiente.",
  },
  {
    icon: TreePine,
    title: "Generación de Árboles",
    desc: "Cree árboles de la ciencia a partir de sus datos bibliográficos utilizando algoritmos inteligentes.",
  },
  {
    icon: BarChart3,
    title: "Visualización Interactiva",
    desc: "Explore sus árboles científicos con visualizaciones interactivas y análisis de datos.",
  },
  {
    icon: Download,
    title: "Exportación Múltiple",
    desc: "Descargue sus árboles en diversos formatos (JSON, CSV, PDF) para publicaciones.",
  },
];

const steps = [
  {
    number: 1,
    title: "Registro y Autenticación",
    desc: "Cree su cuenta con su correo institucional.",
  },
  {
    number: 2,
    title: "Carga de Bibliografía",
    desc: "Suba sus archivos en múltiples formatos (BibTeX, RIS, TXT, CSV).",
  },
  {
    number: 3,
    title: "Generación de Árboles",
    desc: "Ingrese una semilla y genere un árbol científico automáticamente.",
  },
  {
    number: 4,
    title: "Análisis y Descarga",
    desc: "Analice visualizaciones y descargue resultados para publicación.",
  },
];

const capabilities = [
  {
    icon: Gauge,
    title: "Análisis Determinista",
    desc: "Motor bibliométrico con cálculo SAP O(N) que garantiza resultados reproducibles.",
  },
  {
    icon: Code,
    title: "Múltiples Formatos",
    desc: "Soporta CSV, TXT (WoS/Scopus), BibTeX y RIS con detección automática.",
  },
  {
    icon: Lightbulb,
    title: "Ghost Nodes",
    desc: "Extracción automática de referencias no presentes en el corpus original.",
  },
  {
    icon: Award,
    title: "Deduplicación Inteligente",
    desc: "Fusión tipográfica Jaro-Winkler con bucketing O(n·k) sin sacrificar precisión.",
  },
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
          <a className="text-sm font-medium hover:text-primary transition-colors" href="#capabilities">
            Tecnología
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
          <path d="M100 80 Q130 110 120 180" fill="none" stroke="#19c3e6" strokeWidth="0.5" />
          <circle cx="100" cy="20" fill="#19c3e6" r="2" />
          <circle cx="140" cy="80" fill="#19c3e6" r="1.5" />
          <circle cx="180" cy="140" fill="#19c3e6" r="2" />
          <circle cx="60" cy="100" fill="#19c3e6" r="1.5" />
          <circle cx="20" cy="160" fill="#19c3e6" r="2" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
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
            className="flex flex-wrap gap-3 mb-12"
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
            <Link to="/about">
              <button className="px-8 py-4 border border-primary/30 bg-primary/5 hover:bg-primary/10 font-bold rounded-lg transition-all text-primary flex items-center gap-2 group">
                Sobre Nosotros
                <Code className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="glass-card rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-8 relative border border-white/5">
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
            <img
              alt="Visualización del árbol de ciencia"
              className="w-full h-full object-contain relative z-10"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhOY6ZsP7NLhghd4jul_mV7hHJCwamT-D5xqlkj6_T-Q0mrY_zWjO4FCx9syaUzgOp0Tvqeb8wqQuZt0iqQcvCaO_qs01qRz1nlz9EZsehVRgxi-tUB-A0SmAvipAPMB3h6vSIlh88E-GhsBuRgLor0yrBokYpLzy8cAf-TlH8No5ka5Xm6P_pRrvV6Sj96hCVGK-o8kEX7EXOwzIrdd0hQUpGcsdt0lYiLZn8zqCRRy5RCxT5zoBku2p2f3zMJoaShFOFNZacxJ-a"
            />
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
            Herramientas de laboratorio diseñadas para exploración profunda de datos académicos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              Nuestra metodología está optimizada para análisis sistemático, asegurando investigación estructurada y documentada.
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

                  {i < steps.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-primary/50 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 flex items-center justify-center"
          >
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-card p-4 border border-white/5 bg-background-dark/80">
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-primary/10 pointer-events-none" />

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

                <motion.circle
                  cx="100"
                  cy="170"
                  r="5"
                  fill="#19c3e6"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                />

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

              <div className="absolute bottom-4 left-4 right-4 text-[11px] text-slate-400 flex items-center justify-between">
                <span>De una semilla bibliográfica…</span>
                <span className="text-primary font-semibold">…a un árbol completo</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section id="capabilities" className="py-24 px-6 bg-background-dark/50 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
            Tecnología Avanzada
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Motor Bibliométrico de Última Generación
          </h3>
          <p className="text-slate-400">
            Algoritmo v2.0 con 8 iteraciones de mejora continua. Cálculos deterministas que garantizan reproducibilidad académica.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="glass-card p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-all group h-full backdrop-blur">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">{title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass-card p-8 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                ¿Quieres profundizar en la tecnología?
              </h4>
              <p className="text-slate-400 text-sm max-w-2xl">
                Explora documentación técnica completa, comparativa del algoritmo v1.0 vs v2.0, y todas las especificaciones del motor bibliométrico.
              </p>
            </div>
            <Link to="/about" className="flex-shrink-0">
              <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-background-dark rounded-lg transition-all font-bold flex items-center gap-2 whitespace-nowrap">
                Ver Detalles Técnicos
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTA() {
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
          Únete a miles de investigadores que transforman sus revisiones de literatura en visualizaciones científicas.
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
          <Link to="/admin-request">
            <button className="px-8 py-4 border border-white/10 font-bold rounded-lg hover:bg-white/5 transition-all text-slate-100 flex items-center gap-2">
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

  return (
    <footer className="py-16 border-t border-white/5 bg-background-dark">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="flex flex-col items-center gap-3 mb-6 relative">
          <div 
            className="bg-primary/20 p-2 rounded-lg"
          >
            <TreePine className="w-5 h-5 text-primary" />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Tree of Science</h1>
            <p className="text-xs text-slate-500">Universidad Nacional de Colombia</p>
          </div>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Redefiniendo el panorama de revisiones de literatura a través del análisis de precisión científica.
        </p>

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
  return (
    <div className="min-h-screen bg-background-dark text-slate-100">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Capabilities />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}