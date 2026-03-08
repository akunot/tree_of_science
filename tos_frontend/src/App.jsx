import { BrowserRouter as Router } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppProviders } from './app/providers';
import { AppRoutes } from './app/routes';
import './index.css';

/**
 * Componente ErrorBoundary para manejo de errores global
 */
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error) => {
      console.error('Error caught by boundary:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error de Aplicación</h2>
          <p className="text-gray-600 mb-4">
            Ha ocurrido un error inesperado. Recarga la página para continuar.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recargar Página
          </button>
        </div>
      </div>
    );
  }
  
  return children;
}

/**
 * Componente principal de la aplicación
 * Configura los providers y las rutas
 */
function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <AppRoutes />
          </div>
        </Router>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
