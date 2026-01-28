import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { treeAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TreePine, 
  ArrowLeft,
  FileJson,
  Network,
  Info,
  Loader2,
  ExternalLink,
  Layers,
  File
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { select, forceSimulation, forceManyBody, forceCollide, forceY, scaleSqrt } from 'd3';

const TreeDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [containerElement, setContainerElement] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const svgRef = useRef(null);
  const resizeObserver = useRef(null);
  const simulationRef = useRef(null);
  const listContainerRef = useRef(null);

  // ========== QUERY OPTIMIZADO ==========
  const { data: tree, isLoading, error } = useQuery({
    queryKey: ['tree', id],
    queryFn: () => treeAPI.detail(id).then(res => res.data),
    enabled: !!id,
  });

  // ========== ESTADÍSTICAS: DIRECTO DEL BACKEND ==========
  const treeStats = useMemo(() => {
    if (!tree?.arbol_json?.statistics) {
      return { roots: 0, trunks: 0, leaves: 0, total: 0 };
    }
    return tree.arbol_json.statistics;
  }, [tree?.arbol_json?.statistics]);

  // ========== NODOS PROCESADOS ==========
  const processedNodes = useMemo(() => {
    if (!tree?.arbol_json?.nodes) return [];
    
    return tree.arbol_json.nodes.map((node, idx) => ({
      ...node,
      id: node.id || `node-${idx}`,
      hasExternalLink: !!(node.url || node.doi || node.pmid || node.arxiv_id),
    }));
  }, [tree?.arbol_json?.nodes?.length]);

  const containerRefCallback = useCallback((element) => {
    setContainerElement(element);
  }, []);

  const measureDimensions = useCallback(() => {
    const container = containerElement;
    if (!container) return false;

    try {
      const rect = container.getBoundingClientRect();
      
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ 
          width: rect.width,
          height: rect.height
        });
        return true;
      } else {
        setDimensions({ width: 400, height: 400 });
        return true;
      }
    } catch (error) {
      setDimensions({ width: 400, height: 400 });
      return true;
    }
  }, [containerElement]);

  useEffect(() => {
    if (!containerElement || isInitialized) return;

    measureDimensions();
    
    try {
      resizeObserver.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setDimensions({ width, height });
          }
        }
      });
      
      resizeObserver.current.observe(containerElement);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing ResizeObserver:', error);
    }

    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, [containerElement, isInitialized, measureDimensions]);

  // ========== POSICIONAMIENTO RADIAL (FASE 1) ==========
  const getRadialPosition = useCallback((node, nodeIndex, group, containerWidth, containerHeight) => {
    // Dividir nodos por grupo
    const rootNodes = processedNodes.filter(n => n.group === 'root');
    const trunkNodes = processedNodes.filter(n => n.group === 'trunk');
    const leafNodes = processedNodes.filter(n => n.group === 'leaf');
    
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // Configuración por grupo
    if (group === 'root') {
      // RAÍCES: Círculo amplio ABAJO
      const index = rootNodes.findIndex(n => n.id === node.id);
      const angle = (index / Math.max(rootNodes.length, 1)) * Math.PI * 2;
      const radius = containerWidth * 0.35; // Radio amplio
      const yOffset = containerHeight * 0.72; // Abajo
      
      return {
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
        y: yOffset + Math.sin(angle) * (radius * 0.25) + (Math.random() - 0.5) * 15
      };
    } 
    else if (group === 'trunk') {
      // TRONCO: Círculo PEQUEÑO en CENTRO
      const index = trunkNodes.findIndex(n => n.id === node.id);
      const angle = (index / Math.max(trunkNodes.length, 1)) * Math.PI * 2;
      const radius = containerWidth * 0.12; // Radio pequeño
      
      return {
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 15,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 15
      };
    } 
    else {
      // HOJAS: Círculo AMPLIO ARRIBA
      const index = leafNodes.findIndex(n => n.id === node.id);
      const angle = (index / Math.max(leafNodes.length, 1)) * Math.PI * 2;
      const radius = containerWidth * 0.38; // Radio muy amplio
      const yOffset = containerHeight * 0.28; // Arriba
      
      return {
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
        y: yOffset + Math.sin(angle) * (radius * 0.22) + (Math.random() - 0.5) * 15
      };
    }
  }, [processedNodes]);

  // ========== LAYOUT D3: POSICIONAMIENTO INICIAL ==========
  const treeLayout = useMemo(() => {
    if (!processedNodes.length || dimensions.width === 0) return { nodes: [], links: [] };

    const maxNodesForPhysics = 200;
    const nodesToSimulate = processedNodes.slice(0, maxNodesForPhysics);
    
    const nodes = nodesToSimulate.map((d, i) => {
      const baseRadius = 8;
      const scaleFactor = Math.sqrt(d.total_value || 1) * 0.8;
      const radius = Math.max(8, Math.min(22, baseRadius + scaleFactor));
      
      // FASE 1: Posicionamiento radial
      const radialPos = getRadialPosition(d, i, d.group, dimensions.width, dimensions.height);
      
      return {
        ...d,
        x: radialPos.x,
        y: radialPos.y,
        radius: radius,
        index: i,
        vx: 0,
        vy: 0
      };
    });

    return { nodes, links: [] };
  }, [processedNodes, dimensions, getRadialPosition]);

  // ========== FUNCIÓN PARA ABRIR DOCUMENTO ==========
  const openDocument = useCallback((node) => {
    let url = null;
    let source = '';

    if (node.doi) {
      url = `https://doi.org/${node.doi}`;
      source = 'DOI';
    } else if (node.pmid) {
      url = `https://pubmed.ncbi.nlm.nih.gov/${node.pmid}`;
      source = 'PubMed';
    } else if (node.arxiv_id) {
      url = `https://arxiv.org/abs/${node.arxiv_id}`;
      source = 'arXiv';
    } else if (node.url) {
      url = node.url;
      source = 'URL';
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast({
        title: `Abriendo documento`,
        description: `${source}: ${node.label}`,
        duration: 2000,
      });
    } else {
      toast({
        title: 'Sin enlace disponible',
        description: `No hay información de enlace para "${node.label}"`,
        variant: 'destructive',
        duration: 2000,
      });
    }
  }, [toast]);

  // ========== EXPORTAR A JSON ==========
  const exportToJSON = useCallback(() => {
    const exportData = {
      title: tree.title,
      seed: tree.seed,
      statistics: treeStats,
      generated_at: tree.arbol_json.metadata?.generated_at,
      nodes: processedNodes.map(node => ({
        id: node.id,
        label: node.label,
        group: node.group,
        type_label: node.type_label,
        year: node.year,
        authors: node.authors,
        doi: node.doi,
        pmid: node.pmid,
        arxiv_id: node.arxiv_id,
        url: node.url,
        root: node.root,
        trunk: node.trunk,
        leaf: node.leaf,
        sap: node._sap,
        times_cited: node.times_cited
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arbol-ciencia-${tree.title}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Descarga exitosa',
      description: `Árbol exportado a JSON con ${processedNodes.length} nodos`,
      duration: 2000,
    });
  }, [tree, treeStats, processedNodes, toast]);

  // ========== EXPORTAR A CSV ==========
  const exportToCSV = useCallback(() => {
    const headers = ['ID', 'Título', 'Tipo', 'Año', 'Autores', 'DOI', 'PMID', 'arXiv', 'URL', 'Raíz', 'Tronco', 'Hoja', 'SAP', 'Citas'];
    
    const rows = processedNodes.map(node => [
      node.id,
      node.label,
      node.type_label,
      node.year || '',
      typeof node.authors === 'string' ? node.authors : Array.isArray(node.authors) ? node.authors.join('; ') : '',
      node.doi || '',
      node.pmid || '',
      node.arxiv_id || '',
      node.url || '',
      node.root || 0,
      node.trunk || 0,
      node.leaf || 0,
      node._sap || 0,
      node.times_cited || 0
    ]);

    let csvContent = [headers, ...rows]
      .map(row => row.map(cell => {
        const cellString = String(cell || '');
        return cellString.includes(',') || cellString.includes('"') || cellString.includes('\n') 
          ? `"${cellString.replace(/"/g, '""')}"` 
          : cellString;
      }).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arbol-ciencia-${tree.title}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Descarga exitosa',
      description: `Árbol exportado a CSV con ${processedNodes.length} nodos`,
      duration: 2000,
    });
  }, [tree, processedNodes, toast]);

  // ========== SISTEMA HÍBRIDO: RADIAL + COLISIÓN + FUERZAS DÉBILES ==========
  const restartSimulation = useCallback(() => {
    if (!svgRef.current) {
      console.error('svgRef.current es null');
      return;
    }
    
    if (!treeLayout.nodes.length) {
      console.warn('No hay nodos para renderizar');
      return;
    }

    if (dimensions.width <= 0 || dimensions.height <= 0) {
      console.warn('Dimensiones inválidas');
      return;
    }

    console.log('🌳 Iniciando simulación híbrida con', treeLayout.nodes.length, 'nodos');

    setIsSimulating(true);

    const nodes = treeLayout.nodes.map(n => ({ ...n }));
    
    // ========== FASE 2: COLISIÓN ROBUSTA ==========
    const simulation = forceSimulation(nodes)
      .alphaDecay(0.012)
      .velocityDecay(0.45)
      
      // SIN repulsión de carga (para mantener estructura)
      .force("charge", null)
      
      // Colisión ROBUSTA (lo más importante)
      .force("collide", forceCollide()
        .radius(d => (d.radius || 8) + 7)
        .strength(1.0)
        .iterations(12)
      )
      
      // ========== FASE 3: FUERZAS Y DÉBILES (Mantiene forma) ==========
      .force("y", forceY(d => {
        if (d.group === 'root') {
          return dimensions.height * 0.72;
        } else if (d.group === 'trunk') {
          return dimensions.height / 2;
        } else {
          return dimensions.height * 0.28;
        }
      }).strength(0.04))  // DÉBIL (solo mantiene, no controla)
      
      .stop();

    // Ejecutar simulación balanceada
    const ticks = 250;
    for (let i = 0; i < ticks; i++) {
      simulation.tick();
      
      // Restricciones suaves de bordes
      nodes.forEach(node => {
        const padding = node.radius + 3;
        const margin = 5;
        node.x = Math.max(margin + padding, Math.min(dimensions.width - margin - padding, node.x));
        node.y = Math.max(margin + padding, Math.min(dimensions.height - margin - padding, node.y));
      });
    }

    console.log('✅ Simulación completada');

    simulationRef.current = simulation;
    
    const svgElement = svgRef.current;
    const svg = select(svgElement);
    
    if (!svgElement) {
      console.error('SVG element not found');
      return;
    }
    
    svg.selectAll("g.node").remove();
    svg.selectAll(".link").remove();
    
    console.log('🎨 Renderizando', nodes.length, 'nodos');
    
    // Mantener radios sin escalar
    const nodeGroups = svg.selectAll("g.node")
      .data(nodes, (d, i) => d.id || i)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer");

    // Círculos con sombra
    nodeGroups.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => {
        if (d.group === 'root') return '#ffb74d';
        if (d.group === 'trunk') return '#824d13';
        return '#4caf50';
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.15))")
      .style("transition", "all 0.2s ease")
      .on("mouseenter", function(event, d) {
        select(this)
          .transition()
          .duration(150)
          .attr("stroke-width", 4)
          .attr("stroke", "#333");
        
        setHoveredNode(d);
        setShowTooltip(true);
      })
      .on("mouseleave", function() {
        select(this)
          .transition()
          .duration(150)
          .attr("stroke-width", 2)
          .attr("stroke", "#fff");
        
        setShowTooltip(false);
      })
      .on("mousemove", (event) => {
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (svgRect) {
          let x = event.clientX;
          let y = event.clientY;

          const tooltipWidth = 300;
          if (x + tooltipWidth + 15 > window.innerWidth) {
            x = window.innerWidth - tooltipWidth - 15;
          }

          const tooltipHeight = 200;
          if (y + tooltipHeight + 15 > window.innerHeight) {
            y = window.innerHeight - tooltipHeight - 15;
          }

          setTooltipPosition({ x, y });
        }
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        openDocument(d);
      });

    setIsSimulating(false);

  }, [treeLayout.nodes, dimensions, openDocument]);

  // ========== TRIGGER SIMULATION ==========
  useEffect(() => {
    if (treeLayout.nodes.length > 0 && dimensions.width > 0 && dimensions.height > 0) {
      restartSimulation();
    }
  }, [treeLayout.nodes.length, dimensions.width, dimensions.height, restartSimulation]);

  // ========== VIRTUAL SCROLLING ==========
  const ITEM_HEIGHT = 180;
  const VISIBLE_ITEMS = Math.ceil(400 / ITEM_HEIGHT) + 2;
  
  const startIndex = Math.max(0, Math.floor(scrollOffset / ITEM_HEIGHT));
  const endIndex = Math.min(processedNodes.length, startIndex + VISIBLE_ITEMS);
  
  const visibleNodes = processedNodes.slice(startIndex, endIndex);

  // ========== RENDERIZAR NODO EN LISTA ==========
  const renderNode = useCallback((node, index) => {
    const getLink = () => {
      if (node.doi) return `https://doi.org/${node.doi}`;
      if (node.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${node.pmid}`;
      if (node.arxiv_id) return `https://arxiv.org/abs/${node.arxiv_id}`;
      if (node.url) return node.url;
      return null;
    };

    const link = getLink();
    const borderColor = 
      node.group === 'root' ? '#ffb74d' : 
      node.group === 'trunk' ? '#824d13' : 
      '#4caf50';

    return (
      <div 
        key={`${node.id}-${index}`}
        className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition-all cursor-pointer hover:border-blue-300 hover:shadow-md"
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: borderColor,
          marginBottom: '8px'
        }}
        onClick={() => openDocument(node)}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-semibold text-gray-900 leading-tight flex-1">
              {node.label || 'Título no disponible'}
            </h4>
            {link && (
              <div className="ml-2 text-blue-600 flex-shrink-0">
                <ExternalLink className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="text-xs text-gray-600">
            <strong>Autores:</strong> {
              typeof node.authors === 'string' 
                ? node.authors 
                : Array.isArray(node.authors)
                  ? node.authors.slice(0, 3).join('; ')
                  : 'Autor desconocido'
            }
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span><strong>Año:</strong> {node.year || 'N/A'}</span>
            <span className="flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                node.group === 'root' ? 'bg-[#ffb74d]' : 
                node.group === 'trunk' ? 'bg-[#824d13]' : 
                'bg-[#4caf50]'
              }`}></span>
              {node.type_label}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {node.root > 0 && (
              <Badge variant="outline" className="text-xs bg-[#ffb74d]/10 text-[#ffb74d]">
                Raíz: {node.root.toFixed(2)}
              </Badge>
            )}
            {node.trunk > 0 && (
              <Badge variant="outline" className="text-xs bg-[#824d13]/10 text-[#824d13]">
                Tronco: {node.trunk.toFixed(2)}
              </Badge>
            )}
            {node.leaf > 0 && (
              <Badge variant="outline" className="text-xs bg-[#4caf50]/10 text-[#4caf50]">
                Hoja: {node.leaf.toFixed(2)}
              </Badge>
            )}
            {node._sap > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                SAP: {node._sap.toFixed(2)}
              </Badge>
            )}
          </div>

          {node.doi && (
            <div className="text-xs text-gray-500">
              <strong>DOI:</strong> {node.doi}
            </div>
          )}
        </div>
      </div>
    );
  }, [openDocument]);

  // ========== TOOLTIP ==========
  const TooltipComponent = () => {
    if (!showTooltip || !hoveredNode) return null;

    const getDocumentSource = () => {
      if (hoveredNode.doi) return '📄 DOI';
      if (hoveredNode.pmid) return '🏥 PubMed';
      if (hoveredNode.arxiv_id) return '📚 arXiv';
      if (hoveredNode.url) return '🔗 URL';
      return '❌ Sin enlace';
    };

    const getAuthorsString = () => {
      if (!hoveredNode.authors) return null;
      
      if (typeof hoveredNode.authors === 'string') {
        return hoveredNode.authors.substring(0, 50);
      } else if (Array.isArray(hoveredNode.authors)) {
        return hoveredNode.authors.slice(0, 2).join(', ').substring(0, 50);
      }
      return null;
    };

    const authorsText = getAuthorsString();

    return (
      <div
        style={{
          position: 'fixed',
          left: `${tooltipPosition.x + 15}px`,
          top: `${tooltipPosition.y + 15}px`,
          zIndex: 1000,
          pointerEvents: 'none'
        }}
        className="bg-gray-900 text-white px-4 py-3 rounded-lg text-xs max-w-xs shadow-2xl border border-gray-700 backdrop-blur"
      >
        <p className="font-semibold text-sm mb-2 leading-tight max-h-12 overflow-hidden text-ellipsis">
          {hoveredNode.label || 'Documento'}
        </p>

        <p className="text-gray-300 text-xs mb-2">
          {hoveredNode.group === 'root' ? '🌱 Raíz (Fundamento)' : 
           hoveredNode.group === 'trunk' ? '🌳 Tronco (Central)' : 
           '🍃 Hoja (Contemporáneo)'}
        </p>

        {authorsText && (
          <p className="text-gray-400 text-xs mb-1 truncate">
            👤 {authorsText}...
          </p>
        )}

        {hoveredNode.year && (
          <p className="text-gray-400 text-xs mb-2">
            📅 {hoveredNode.year}
          </p>
        )}

        <p className="text-blue-300 text-xs font-semibold mb-2">
          {getDocumentSource()}
        </p>

        <p className="text-gray-400 text-xs border-t border-gray-700 pt-1">
          ↻ Click para abrir
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error cargando árbol: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                <button 
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900 flex-shrink-0"
                >
                <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{tree.title}</h1>
                <p className="text-sm text-gray-600 mt-1">Semilla: {tree.seed}</p>
                </div>
              </div>

              {/* Botones de descarga */}
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              onClick={exportToJSON}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 flex-1 md:flex-initial"
            >
              <FileJson className="h-4 w-4" />
              <span className="hidden sm:inline">JSON</span>
            </Button>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 flex-1 md:flex-initial"
            >
              <File className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Visualización D3 */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Árbol de Ciencia
                </CardTitle>
                {isSimulating && (
                  <CardDescription className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando estructura híbrida...
                  </CardDescription>
                )}
                <CardDescription className="flex items-center gap-2 text-green-600 mt-2 text-xs md:text-sm">
                  ✓ Pasa el mouse y haz click para abrir documentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  ref={containerRefCallback}
                  className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden"
                  style={{ 
                    minHeight: '350px',
                    height: '100%',
                    aspectRatio: '16/9'
                  }}
                >
                  <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>🍃 Hojas</span>
                    <span className="font-medium">{treeStats.leaves}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#4caf50] h-2 rounded-full" 
                      style={{ width: `${treeStats.total ? (treeStats.leaves / treeStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm mt-4">
                    <span>🌳 Tronco</span>
                    <span className="font-medium">{treeStats.trunks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#824d13] h-2 rounded-full" 
                      style={{ width: `${treeStats.total ? (treeStats.trunks / treeStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm mt-4">
                    <span>🌱 Raíces</span>
                    <span className="font-medium">{treeStats.roots}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#ffb74d] h-2 rounded-full" 
                      style={{ width: `${treeStats.total ? (treeStats.roots / treeStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>

                  <Separator className="my-4" />
                  
                  <div className="text-sm">
                    <p className="font-semibold text-gray-700">Nodos Totales</p>
                    <p className="text-xl font-bold text-blue-600">{treeStats.total}</p>
                  </div>

                  <div className="text-sm">
                    <p className="font-semibold text-gray-700">SAP Promedio</p>
                    <p className="text-xl font-bold text-green-600">
                      {treeStats.average_sap?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de nodos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              Artículos en el Árbol
            </CardTitle>
            <CardDescription>
              {processedNodes.length} artículos ordenados por relevancia - Click para abrir
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processedNodes.length > 0 ? (
              <div
                ref={listContainerRef}
                className="border border-gray-200 rounded-lg p-4 space-y-0"
                style={{
                  height: '400px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
                onScroll={(e) => setScrollOffset(e.currentTarget.scrollTop)}
              >
                <div style={{ height: `${startIndex * ITEM_HEIGHT}px` }} />
                
                {visibleNodes.map((node, i) => 
                  renderNode(node, startIndex + i)
                )}
                
                <div style={{ height: `${(processedNodes.length - endIndex) * ITEM_HEIGHT}px` }} />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay nodos disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tooltip */}
      <TooltipComponent />
    </div>
  );
};

export default TreeDetail;