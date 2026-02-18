import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Mail,
  LogOut,
  Fingerprint,
  Clock,
  Shield,
  HelpCircle,
  Globe,
} from 'lucide-react';

const AccountSuspended = () => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4"
      style={{
        backgroundColor: "#0f1513",
        backgroundImage: `
          radial-gradient(circle at 2px 2px, rgba(25, 195, 230, 0.03) 1px, transparent 0);
        `,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 w-full flex items-center justify-between border-b border-[#19c3e6]/10 px-6 py-3 z-50"
        style={{
          background: "rgba(15, 21, 19, 0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3 text-[#19c3e6]">
          <AlertTriangle className="h-6 w-6" />
          <Link to="/">
            <h2 className="text-white text-lg font-bold tracking-tight hover:underline cursor-pointer">
              Árbol de la Ciencia
            </h2>
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="w-full max-w-[560px] mt-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Alert Icon */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full border-2 border-red-500/40 flex items-center justify-center"
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
              }}
            >
              <AlertTriangle className="h-12 w-12 text-red-500" strokeWidth={1.5} />
            </div>
          </motion.div>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl overflow-hidden border border-[#19c3e6]/20 shadow-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Title & Description */}
            <div className="text-center space-y-4">
              <motion.h1
                variants={itemVariants}
                className="text-3xl md:text-4xl font-black text-[#f5f5f0] tracking-tight leading-tight"
              >
                Cuenta Suspendida
              </motion.h1>
              <motion.div
                variants={itemVariants}
                className="h-1 w-24 bg-red-500 mx-auto rounded-full"
              ></motion.div>
              <motion.p
                variants={itemVariants}
                className="text-[#f5f5f0]/60 text-sm md:text-base leading-relaxed max-w-md mx-auto"
              >
                Tu acceso al sistema ha sido suspendido temporalmente por motivos de seguridad.
                <span className="text-[#19c3e6] font-medium italic block mt-2">
                  Se ha detectado actividad inusual en tu cuenta. Esta acción es preventiva.
                </span>
              </motion.p>
            </div>

            {/* Información de soporte */}
            <motion.div
              variants={itemVariants}
              className="rounded-lg p-4 border border-[#19c3e6]/10 text-xs md:text-sm space-y-2"
              style={{ background: 'rgba(0,0,0,0.4)' }}
            >
              <p className="text-[#f5f5f0]/70">
                Para reactivar tu cuenta, por favor contacta al equipo de soporte de la plataforma.
              </p>
              <p className="text-[#19c3e6] font-semibold">
                Correo: soporte@unal.edu.co
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-3"
            >

              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#19c3e6] hover:bg-[#19c3e6]/90 text-[#1a2e05] font-black py-4 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                  style={{
                    boxShadow: '0 0 20px rgba(25, 195, 230, 0.3)',
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  Volver a Inicio de Sesión
                </motion.button>
              </Link>

            </motion.div>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              className="text-center pt-4 border-t border-[#19c3e6]/10"
            >
              <p className="text-[#f5f5f0]/40 text-xs uppercase tracking-widest font-bold">
                © {new Date().getFullYear()} Universidad Nacional de Colombia. Todos los derechos reservados.
              </p>
            </motion.div>
          </div>
        </motion.div>

      </motion.main>

      {/* Background Decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 1 }}
        className="fixed bottom-0 right-0 p-8 pointer-events-none"
      >
        <AlertTriangle className="h-64 w-64 text-red-500" strokeWidth={0.5} />
      </motion.div>
    </div>
  );
};

export default AccountSuspended;