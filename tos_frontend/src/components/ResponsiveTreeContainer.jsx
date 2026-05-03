/**
 * Contenedor responsive para visualizaciones D3.js de árboles
 * 
 * ✅ MOBILE: Ajuste automático para tablets y móviles
 * ✅ ACCESSIBILITY: Touch events y controles de zoom
 * ✅ PERFORMANCE: Debounce y renderizado optimizado
 */
import React, { useRef, useEffect, useState } from 'react';
import { useResponsiveD3 } from '@/hooks/useResponsiveD3';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

export const ResponsiveTreeContainer = ({ 
  children, 
  className = '', 
  showControls = true,
  onZoomChange,
  onPanChange 
}) => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const {
    width,
    height,
    viewBox,
    scale,
    zoom,
    pan,
    setZoom,
    setPan,
    getTransform,
    resetView,
    getDeviceType,
    getDeviceConfig,
    handleDragStart,
    handleTouchStart,
    isMobile,
    isTablet,
    isDesktop,
  } = useResponsiveD3(containerRef, {
    padding: isMobile ? 10 : 20,
    minZoom: 0.1,
    maxZoom: 3,
  });

  // Notificar cambios de zoom/pan
  useEffect(() => {
    onZoomChange?.(zoom);
  }, [zoom, onZoomChange]);

  useEffect(() => {
    onPanChange?.(pan);
  }, [pan, onPanChange]);

  // Controles de zoom
  const handleZoomIn = () => {
    const newZoom = Math.min(3, zoom * 1.2);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.1, zoom / 1.2);
    setZoom(newZoom);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Escuchar cambios de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const deviceConfig = getDeviceConfig();

  return (
    <div className={`relative w-full ${className}`}>
      {/* Contenedor principal */}
      <div
        ref={containerRef}
        className={`relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${
          isMobile ? 'h-64' : isTablet ? 'h-96' : 'h-[500px]'
        }`}
        style={{
          touchAction: 'none', // Mejorar touch events
          cursor: pan.x !== 0 || pan.y !== 0 ? 'grabbing' : 'grab',
        }}
      >
        {/* SVG con viewBox responsive */}
        <svg
          width={width}
          height={height}
          viewBox={viewBox}
          className="w-full h-full"
          style={{ transform: getTransform() }}
          onMouseDown={handleDragStart}
          onTouchStart={handleTouchStart}
        >
          {/* Renderizar hijos (árbol D3) */}
          {React.cloneElement(children, {
            width,
            height,
            scale,
            deviceConfig,
            isMobile,
            isTablet,
            isDesktop,
          })}
        </svg>

        {/* Indicadores de dispositivo (solo desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {getDeviceType()} • {width.toFixed(0)}×{height.toFixed(0)} • {zoom.toFixed(2)}x
          </div>
        )}
      </div>

      {/* Controles de zoom y navegación */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          {/* Zoom controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Acercar"
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Alejar"
              disabled={zoom <= 0.1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetView}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Restablecer vista"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Fullscreen button */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Pantalla completa"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Instrucciones para móviles */}
      {isMobile && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg max-w-[200px]">
          <p className="mb-1">📱 Navegación táctil:</p>
          <ul className="text-xs space-y-1">
            <li>• Arrastra para mover</li>
            <li>• Pincha para hacer zoom</li>
          </ul>
        </div>
      )}

      {/* Indicador de carga o procesamiento */}
      {/* <div className="absolute top-4 left-4">
        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          Escalando: {scale.toFixed(2)}x
        </div>
      </div> */}
    </div>
  );
};

// Componente simplificado para árboles sin controles complejos
export const SimpleResponsiveTree = ({ children, className = '' }) => {
  const containerRef = useRef(null);
  
  const {
    width,
    height,
    viewBox,
    scale,
    getDeviceConfig,
    isMobile,
    isTablet,
    isDesktop,
  } = useResponsiveD3(containerRef, {
    padding: 10,
    minZoom: 0.5,
    maxZoom: 2,
  });

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden ${className}`}
      style={{ height: isMobile ? '300px' : '400px' }}
    >
      <svg
        width={width}
        height={height}
        viewBox={viewBox}
        className="w-full h-full"
      >
        {React.cloneElement(children, {
          width,
          height,
          scale,
          deviceConfig: getDeviceConfig(),
          isMobile,
          isTablet,
          isDesktop,
        })}
      </svg>
    </div>
  );
};
