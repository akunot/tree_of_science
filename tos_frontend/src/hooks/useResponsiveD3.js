/**
 * Hook para hacer visualizaciones D3.js responsive
 * 
 * ✅ MOBILE: Ajuste automático de viewBox para tablets y móviles
 * ✅ PERFORMANCE: Debounce para evitar recalculados excesivos
 * ✅ ACCESIBILITY: Manejo de touch events y zoom
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export const useResponsiveD3 = (containerRef, options = {}) => {
  const {
    padding = 20,
    minZoom = 0.1,
    maxZoom = 3,
    defaultWidth = 800,
    defaultHeight = 600,
  } = options;

  const [dimensions, setDimensions] = useState({
    width: defaultWidth,
    height: defaultHeight,
    viewBox: `0 0 ${defaultWidth} ${defaultHeight}`,
  });

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef(null);

  // Función debounce para resize
  const debounce = useCallback((func, delay) => {
    return (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Calcular dimensiones responsive
  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) return dimensions;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Dimensiones del contenedor con padding
    const containerWidth = rect.width - padding * 2;
    const containerHeight = window.innerHeight < 768 
      ? Math.min(rect.height - padding * 2, 400) // Móvil: altura limitada
      : rect.height - padding * 2; // Desktop/Tablet: altura completa

    // Mantener aspect ratio consistente
    const aspectRatio = defaultWidth / defaultHeight;
    let newWidth = containerWidth;
    let newHeight = containerWidth / aspectRatio;

    // Ajustar si no cabe en altura
    if (newHeight > containerHeight) {
      newHeight = containerHeight;
      newWidth = containerHeight * aspectRatio;
    }

    // Mínimos absolutos para móviles
    if (newWidth < 300) {
      newWidth = 300;
      newHeight = 300 / aspectRatio;
    }

    const viewBox = `0 0 ${newWidth} ${newHeight}`;

    return {
      width: newWidth,
      height: newHeight,
      viewBox,
      scale: newWidth / defaultWidth,
    };
  }, [containerRef, padding, defaultWidth, defaultHeight, dimensions]);

  // Actualizar dimensiones en resize
  const handleResize = useCallback(debounce(() => {
    const newDimensions = calculateDimensions();
    setDimensions(newDimensions);
  }, 250), [calculateDimensions, debounce]);

  // Manejo de zoom con mouse wheel
  const handleWheel = useCallback((event) => {
    if (!containerRef.current) return;

    event.preventDefault();
    
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom * delta));
    
    setZoom(newZoom);
  }, [zoom, minZoom, maxZoom, containerRef]);

  // Manejo de pan con drag
  const handleDragStart = useCallback((event) => {
    if (!containerRef.current) return;

    const startX = event.clientX - pan.x;
    const startY = event.clientY - pan.y;

    const handleMouseMove = (e) => {
      setPan({
        x: e.clientX - startX,
        y: e.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [pan, containerRef]);

  // Manejo de touch events para móviles
  const handleTouchStart = useCallback((event) => {
    if (!containerRef.current || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const startX = touch.clientX - pan.x;
    const startY = touch.clientY - pan.y;

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - startX,
        y: touch.clientY - startY,
      });
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [pan, containerRef]);

  // Resetear vista
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    
    const newDimensions = calculateDimensions();
    setDimensions(newDimensions);
  }, [calculateDimensions]);

  // Obtener transform string para SVG
  const getTransform = useCallback(() => {
    return `translate(${pan.x}, ${pan.y}) scale(${zoom})`;
  }, [pan, zoom]);

  // Detectar tipo de dispositivo
  const getDeviceType = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  // Configuración específica por dispositivo
  const getDeviceConfig = useCallback(() => {
    const deviceType = getDeviceType();
    
    switch (deviceType) {
      case 'mobile':
        return {
          nodeRadius: 4,
          fontSize: 10,
          linkWidth: 1,
          padding: 10,
          showLabels: false, // Opcional: ocultar etiquetas en móvil
        };
      case 'tablet':
        return {
          nodeRadius: 6,
          fontSize: 12,
          linkWidth: 1.5,
          padding: 15,
          showLabels: true,
        };
      default: // desktop
        return {
          nodeRadius: 8,
          fontSize: 14,
          linkWidth: 2,
          padding: 20,
          showLabels: true,
        };
    }
  }, [getDeviceType]);

  // Setup inicial y resize listener
  useEffect(() => {
    if (!containerRef.current) return;

    // Calcular dimensiones iniciales
    const initialDimensions = calculateDimensions();
    setDimensions(initialDimensions);

    // Agregar resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [containerRef, calculateDimensions, handleResize]);

  // Agregar wheel listener para zoom
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, handleWheel]);

  return {
    // Dimensiones
    width: dimensions.width,
    height: dimensions.height,
    viewBox: dimensions.viewBox,
    scale: dimensions.scale,
    
    // Controles
    zoom,
    pan,
    setZoom,
    setPan,
    
    // Utilidades
    getTransform,
    resetView,
    getDeviceType,
    getDeviceConfig,
    
    // Event handlers
    handleDragStart,
    handleTouchStart,
    
    // Estado
    isMobile: getDeviceType() === 'mobile',
    isTablet: getDeviceType() === 'tablet',
    isDesktop: getDeviceType() === 'desktop',
  };
};

// Hook adicional para manejar zoom y pan de forma más sencilla
export const useD3Zoom = (svgRef, options = {}) => {
  const {
    scaleExtent = [0.1, 3],
    translateExtent = [[-1000, -1000], [1000, 1000]],
  } = options;

  const [currentTransform, setCurrentTransform] = useState({
    k: 1,
    x: 0,
    y: 0,
  });

  // Aplicar transformación a SVG
  const applyTransform = useCallback((transform) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    svg.setAttribute('viewBox', `${transform.x} ${transform.y} ${svg.clientWidth * transform.k} ${svg.clientHeight * transform.k}`);
    setCurrentTransform(transform);
  }, [svgRef]);

  // Zoom to fit
  const zoomToFit = useCallback((bounds) => {
    if (!svgRef.current || !bounds) return;

    const svg = svgRef.current;
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    
    const boundsWidth = bounds[1][0] - bounds[0][0];
    const boundsHeight = bounds[1][1] - bounds[0][1];
    
    const scale = Math.min(
      svgWidth / boundsWidth,
      svgHeight / boundsHeight
    ) * 0.9; // 90% para dejar padding
    
    const translate = [
      -(bounds[0][0] * scale) + (svgWidth - boundsWidth * scale) / 2,
      -(bounds[0][1] * scale) + (svgHeight - boundsHeight * scale) / 2
    ];

    applyTransform({ k: scale, x: translate[0], y: translate[1] });
  }, [svgRef, applyTransform]);

  return {
    currentTransform,
    applyTransform,
    zoomToFit,
  };
};
