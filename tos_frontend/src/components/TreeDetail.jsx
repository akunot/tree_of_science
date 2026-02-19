import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { treeAPI } from '../lib/api';
import {
  ArrowLeft,
  FileJson,
  Network,
  Info,
  Loader2,
  ExternalLink,
  Layers,
  File,
  FileText,
  Share2,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { select, forceSimulation, forceCollide, forceY, forceX } from 'd3';

const TreeDetail = () => {
  const { id } = useParams();
  const [containerElement, setContainerElement] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [nodeFilter, setNodeFilter] = useState('all'); // 'all' | 'leaves' | 'trunks' | 'roots'
  const [showSapInfo, setShowSapInfo] = useState(false);

  const svgRef = useRef(null);
  const resizeObserver = useRef(null);
  const listContainerRef = useRef(null);

  // Query para obtener árbol
  const { data: tree, isLoading, error } = useQuery({
    queryKey: ['tree', id],
    queryFn: () => treeAPI.detail(id).then(res => res.data),
    enabled: !!id,
  });

  // Estadísticas
  const treeStats = useMemo(() => {
    if (!tree?.arbol_json?.statistics) {
      return { roots: 0, trunks: 0, leaves: 0, total: 0 };
    }
    return tree.arbol_json.statistics;
  }, [tree?.arbol_json?.statistics]);

  // Nodos procesados (todos)
  const processedNodes = useMemo(() => {
    if (!tree?.arbol_json?.nodes) return [];
    return tree.arbol_json.nodes.map((node, idx) => ({
      ...node,
      id: node.id || `node-${idx}`,
      hasExternalLink: !!(node.url || node.doi || node.pmid || node.arxiv_id),
    }));
  }, [tree?.arbol_json?.nodes]);

  // Nodos visibles según el filtro (para SVG y lista)
  const filteredNodes = useMemo(() => {
    if (nodeFilter === 'all') return processedNodes;
    if (nodeFilter === 'roots') return processedNodes.filter(n => n.group === 'root');
    if (nodeFilter === 'trunks') return processedNodes.filter(n => n.group === 'trunk');
    if (nodeFilter === 'leaves') return processedNodes.filter(n => n.group === 'leaf');
    return processedNodes;
  }, [processedNodes, nodeFilter]);

  const containerRefCallback = useCallback((element) => {
    setContainerElement(element);
  }, []);

  const measureDimensions = useCallback(() => {
    const container = containerElement;
    if (!container) return false;

    try {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
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

  // Agrupar nodos
  const groupedNodes = useMemo(() => {
    const roots = [];
    const trunks = [];
    const leaves = [];
    (processedNodes || []).forEach((n) => {
      if (n.group === 'root') roots.push(n);
      else if (n.group === 'trunk') trunks.push(n);
      else leaves.push(n);
    });
    return { roots, trunks, leaves };
  }, [processedNodes]);

  // Posicionamiento radial
  const getRadialPosition = useCallback(
    (node, nodeIndex, group, containerWidth, containerHeight) => {
      const { roots, trunks, leaves } = groupedNodes;
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;

      if (group === 'root') {
        const index = roots.findIndex((n) => n.id === node.id);
        const count = Math.max(roots.length, 1);
        const span = containerWidth * 0.7;
        const startX = centerX - span / 2;
        const x = startX + (span / Math.max(count - 1, 1)) * index + (Math.random() - 0.5) * 10;
        const baseY = containerHeight * 0.78;
        const y = baseY + Math.sin((index / count) * Math.PI) * (containerHeight * 0.03) + (Math.random() - 0.5) * 6;
        return { x, y };
      }

      if (group === 'trunk') {
        const index = trunks.findIndex((n) => n.id === node.id);
        const count = Math.max(trunks.length, 1);
        const spanY = containerHeight * 0.35;
        const startY = centerY - spanY / 2;
        const y = startY + (spanY / Math.max(count - 1, 1)) * index + (Math.random() - 0.5) * 10;
        const baseX = centerX;
        const x = baseX + Math.sin((index / count) * Math.PI * 2) * (containerWidth * 0.04) + (Math.random() - 0.5) * 6;
        return { x, y };
      }

      const index = leaves.findIndex((n) => n.id === node.id);
      const count = Math.max(leaves.length, 1);
      const span = containerWidth * 0.8;
      const startX = centerX - span / 2;
      const x = startX + (span / Math.max(count - 1, 1)) * index + (Math.random() - 0.5) * 12;
      const baseY = containerHeight * 0.22;
      const y = baseY - Math.cos((index / count) * Math.PI) * (containerHeight * 0.04) + (Math.random() - 0.5) * 6;
      return { x, y };
    },
    [groupedNodes]
  );

  // Layout D3
  const treeLayout = useMemo(() => {
    if (!filteredNodes.length || dimensions.width === 0) return { nodes: [], links: [] };

    const maxNodesForPhysics = 200;
    const nodesToSimulate = filteredNodes.slice(0, maxNodesForPhysics);

    const nodes = nodesToSimulate.map((d, i) => {
      const baseRadius = 6;
      const scaleFactor = Math.sqrt(d.total_value || 1) * 0.8;
      const radius = Math.max(6, Math.min(18, baseRadius + scaleFactor));

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
  }, [filteredNodes, dimensions, getRadialPosition]);

  // Abrir documento
  const openDocument = useCallback((node) => {
    let url = null;

    if (node.doi) {
      url = `https://doi.org/${node.doi}`;
    } else if (node.pmid) {
      url = `https://pubmed.ncbi.nlm.nih.gov/${node.pmid}`;
    } else if (node.arxiv_id) {
      url = `https://arxiv.org/abs/${node.arxiv_id}`;
    } else if (node.url) {
      url = node.url;
    }

    if (!url) {
      window.alert('Este nodo no tiene un enlace externo disponible para abrir.');
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  // Exportar JSON
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
    a.download = `arbol-${tree.title || 'ciencia'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [tree, treeStats, processedNodes]);

  // Exportar CSV
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
    a.download = `arbol-${tree.title || 'ciencia'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [tree, processedNodes]);

  // Exportar PDF usando el endpoint del backend (/tree/<id>/download/pdf/)
  const exportToPDF = useCallback(async () => {
    if (!id) return;

    try {
      const response = await treeAPI.download(id, 'pdf');
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;

      const safeTitle = (tree?.title || 'arbol_ciencia')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_\\-]+/g, '_')
        .toLowerCase();

      a.download = `${safeTitle}_${tree?.id || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('No se pudo descargar el PDF. Intenta de nuevo más tarde.');
    }
  }, [id, tree]);

  // Simulación D3
  const restartSimulation = useCallback(() => {
    if (!svgRef.current) return;
    if (!treeLayout.nodes.length) return;
    if (dimensions.width <= 0 || dimensions.height <= 0) return;

    setIsSimulating(true);

    const nodes = treeLayout.nodes.map(n => ({ ...n }));

    const centerX = dimensions.width / 2;

    const simulation = forceSimulation(nodes)
      .alphaDecay(0.015)
      .velocityDecay(0.5)
      .force("charge", null)
      .force(
        "collide",
        forceCollide()
          .radius(d => (d.radius || 6) + 4)
          .strength(1.0)
          .iterations(18)
      )
      .force(
        "y",
        forceY((d) => {
          // acercamos más las bandas verticales para que parezcan un tronco continuo
          const h = dimensions.height;
          if (d.group === 'root') {
            return h * 0.70;     // antes 0.78
          } else if (d.group === 'trunk') {
            return h * 0.55;     // antes 0.50
          } else {
            return h * 0.35;     // antes 0.22
          }
        }).strength(0.12)
      )
      .force(
        "x",
        forceX((d) => {
          const groupNodes = nodes.filter(n => n.group === d.group);
          const idx = groupNodes.findIndex(n => n.id === d.id);
          const count = Math.max(groupNodes.length, 1);
          const t = count === 1 ? 0 : (idx / (count - 1)) * 2 - 1; // [-1, 1]

          // amplitud horizontal según grupo
          const baseAmp = dimensions.width * 0.15;
          const amp =
            d.group === 'root'
              ? baseAmp * 0.6   // raíces un poco abiertas
              : d.group === 'trunk'
              ? baseAmp * 0.3   // tronco más compacto
              : baseAmp * 1.0;  // hojas más abiertas

          // curva: combinamos parábola + ligero desplazamiento lateral por grupo
          const curved = t * Math.abs(t);

          // pequeño “sesgo” lateral para que no quede tan simétrico con pocos nodos
          const groupOffset =
            d.group === 'root' ? -dimensions.width * 0.03
            : d.group === 'trunk' ? 0
            : dimensions.width * 0.03;

          return centerX + curved * amp + groupOffset;
        }).strength(0.10)
      )
      .stop();

    const ticks = 250;
    for (let i = 0; i < ticks; i++) {
      simulation.tick();

      nodes.forEach(node => {
        const padding = node.radius + 3;
        const margin = 5;
        node.x = Math.max(margin + padding, Math.min(dimensions.width - margin - padding, node.x));
        node.y = Math.max(margin + padding, Math.min(dimensions.height - margin - padding, node.y));
      });
    }

    const svgElement = svgRef.current;
    const svg = select(svgElement);

    svg.selectAll("g.node").remove();
    svg.selectAll(".link").remove();

    const nodeGroups = svg.selectAll("g.node")
      .data(nodes, (d, i) => d.id || i)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer");

    nodeGroups.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => {
        if (d.group === 'root') return '#ff9800';
        if (d.group === 'trunk') return '#8b6f47';
        return '#19c3e6';
      })
      .attr("stroke", "#f5f5f0")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))")
      .style("transition", "all 0.2s ease")
      .on("mouseenter", function(event, d) {
        select(this)
          .transition()
          .duration(150)
          .attr("stroke-width", 3)
          .attr("r", d => d.radius + 2);

        setHoveredNode(d);
        setShowTooltip(true);
      })
      .on("mouseleave", function(event, d) {
        select(this)
          .transition()
          .duration(150)
          .attr("stroke-width", 1.5)
          .attr("r", d => d.radius);

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
  }, [treeLayout, dimensions, openDocument]);

  useEffect(() => {
    if (treeLayout.nodes.length > 0 && dimensions.width > 0 && dimensions.height > 0) {
      restartSimulation();
    }
  }, [treeLayout, dimensions, restartSimulation]);

  // Virtual scrolling
  const ITEM_HEIGHT = 160;
  const VISIBLE_ITEMS = Math.ceil(400 / ITEM_HEIGHT) + 2;

  const startIndex = Math.max(0, Math.floor(scrollOffset / ITEM_HEIGHT));
  const endIndex = Math.min(filteredNodes.length, startIndex + VISIBLE_ITEMS);

  const visibleNodes = filteredNodes.slice(startIndex, endIndex);

  // Renderizar nodo
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
      node.group === 'root' ? '#ff9800' :
        node.group === 'trunk' ? '#8b6f47' :
          '#19c3e6';

    return (
      <motion.div
        key={`${node.id}-${index}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
        className="p-3 rounded-lg border transition-all cursor-pointer hover:border-[#19c3e6] hover:bg-[#19c3e6]/5 mb-3"
        style={{
          borderColor: `${borderColor}40`,
          borderLeft: `3px solid ${borderColor}`,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
        }}
        onClick={() => openDocument(node)}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xs md:text-sm font-bold text-[#f5f5f0] leading-tight flex-1 line-clamp-2">
              {node.label || 'Título no disponible'}
            </h4>
            {link && (
              <ExternalLink className="h-3 w-3 md:h-4 md:w-4 text-[#19c3e6] flex-shrink-0" />
            )}
          </div>

          <div className="text-[10px] md:text-xs text-[#f5f5f0]/60">
            <strong>Autores:</strong>{' '}
            {typeof node.authors === 'string'
              ? node.authors.substring(0, 50)
              : Array.isArray(node.authors)
                ? node.authors.slice(0, 2).join('; ').substring(0, 50)
                : 'Autor desconocido'}
          </div>

          <div className="flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs text-[#f5f5f0]/50">
            {node.year && <span><strong>Año:</strong> {node.year}</span>}
            <span className="flex items-center gap-1">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  node.group === 'root' ? 'bg-[#ff9800]' :
                    node.group === 'trunk' ? 'bg-[#8b6f47]' :
                      'bg-[#19c3e6]'
                }`}
              ></span>
              {node.type_label}
            </span>
          </div>

          {node.doi && (
            <div className="text-[10px] text-[#f5f5f0]/40 truncate">
              DOI: {node.doi}
            </div>
          )}
        </div>
      </motion.div>
    );
  }, [openDocument]);

  // Tooltip
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          position: 'fixed',
          left: `${tooltipPosition.x + 15}px`,
          top: `${tooltipPosition.y + 15}px`,
          zIndex: 1000,
          pointerEvents: 'none',
          background: 'rgba(15, 21, 19, 0.95)',
          backdropFilter: 'blur(12px)',
        }}
        className="px-3 py-2 rounded-lg text-[10px] max-w-xs shadow-2xl border border-[#19c3e6]/20"
      >
        <p className="font-semibold text-xs mb-1 leading-tight max-h-8 overflow-hidden text-ellipsis text-[#f5f5f0]">
          {hoveredNode.label || 'Documento'}
        </p>

        <p className="text-[#f5f5f0]/70 text-[10px] mb-1">
          {hoveredNode.group === 'root' ? '🌱 Raíz (Fundamento)' :
            hoveredNode.group === 'trunk' ? '🌳 Tronco (Central)' :
              '🍃 Hoja (Contemporáneo)'}
        </p>

        {authorsText && (
          <p className="text-[#f5f5f0]/60 text-[10px] mb-0.5 truncate">
            👤 {authorsText}...
          </p>
        )}

        {hoveredNode.year && (
          <p className="text-[#f5f5f0]/60 text-[10px] mb-1">
            📅 {hoveredNode.year}
          </p>
        )}

        <p className="text-[#19c3e6] text-[10px] font-semibold mb-1">
          {getDocumentSource()}
        </p>

        <p className="text-[#f5f5f0]/50 text-[10px] border-t border-[#19c3e6]/10 pt-1">
          ↻ Click para abrir
        </p>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1513]">
        <Loader2 className="animate-spin h-8 w-8 text-[#19c3e6]" />
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 text-center space-y-4">
        <p className="text-red-400">Error cargando árbol: {error?.message || 'No se encontró el árbol.'}</p>
        <Link to="/history" className="inline-block px-4 py-2 bg-[#19c3e6] text-[#1a2e05] font-bold rounded-lg">
          Volver al historial
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => window.history.back()}
            className="p-2 rounded-lg hover:bg-[#19c3e6]/10 text-[#f5f5f0] flex-shrink-0 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-black text-[#f5f5f0] tracking-tight">{tree.title}</h1>
            <p className="text-xs md:text-sm text-[#f5f5f0]/60 mt-1">Semilla: {tree.seed}</p>
          </div>
        </div>

        {/* Botones de descarga */}
        <div className="flex gap-2 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToPDF}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg border border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10 text-[#f5f5f0] font-bold text-xs md:text-sm uppercase tracking-widest transition-all"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </motion.button> 

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToJSON}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg border border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10 text-[#f5f5f0] font-bold text-xs md:text-sm uppercase tracking-widest transition-all"
          >
            <FileJson className="h-4 w-4" />
            <span className="hidden sm:inline">JSON</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg border border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10 text-[#f5f5f0] font-bold text-xs md:text-sm uppercase tracking-widest transition-all"
          >
            <File className="h-4 w-4" />
            <span className="hidden sm:inline">CSV</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Grid principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* Visualización D3 */}
        <div className="lg:col-span-3 space-y-4">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#f5f5f0] uppercase tracking-widest flex items-center gap-2">
              <Network className="h-5 w-5 text-[#19c3e6]" />
              Árbol de Ciencia
            </h2>
            {isSimulating && (
              <p className="text-xs text-[#19c3e6] flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generando estructura...
              </p>
            )}
            <p className="text-xs text-[#19c3e6]/70">✓ Pasa el mouse y haz click para abrir documentos</p>
          </div>

          <div
            ref={containerRefCallback}
            className="w-full rounded-xl border border-[#19c3e6]/20 overflow-hidden h-[420px] md:h-auto md:aspect-[16/9]"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(12px)',
              minHeight: '360px',
            }}
          >
            <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>

        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-xl border border-[#19c3e6]/20"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <h3 className="text-xs font-bold text-[#f5f5f0] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-[#19c3e6]" />
              Estadísticas
            </h3>

            <div className="space-y-4">
              {[
                { label: '🍃 Hojas', value: treeStats.leaves, color: '#19c3e6', key: 'leaves' },
                { label: '🌳 Tronco', value: treeStats.trunks, color: '#8b6f47', key: 'trunks' },
                { label: '🌱 Raíces', value: treeStats.roots, color: '#ff9800', key: 'roots' },
              ].map((stat) => (
                <div key={stat.key}>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="text-[#f5f5f0]/70">{stat.label}</span>
                    <span className="text-[#f5f5f0] font-bold">{stat.value}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#19c3e6]/10 rounded-full overflow-hidden border border-[#19c3e6]/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${treeStats.total ? (stat.value / treeStats.total) * 100 : 0}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-full"
                      style={{ background: stat.color }}
                    ></motion.div>
                  </div>
                </div>
              ))}

              <div className="border-t border-[#19c3e6]/10 pt-4 mt-4">
                <div className="text-xs text-[#f5f5f0]/70 mb-1">Nodos Totales</div>
                <p className="text-2xl font-black text-[#19c3e6]">{treeStats.total}</p>
              </div>

              {treeStats.average_sap && (
                <div className="relative">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-[#f5f5f0]/70">SAP Promedio</span>
                    <button
                      type="button"
                      onClick={() => setShowSapInfo((prev) => !prev)}
                      className="p-0.5 rounded-full border border-[#19c3e6]/40 text-[#19c3e6] hover:bg-[#19c3e6]/10"
                    >
                      <Info className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xl font-bold text-[#19c3e6]">{treeStats.average_sap.toFixed(2)}</p>

                  {showSapInfo && (
                    <div
                      className="absolute z-20 mt-2 w-64 text-[10px] px-3 py-2 rounded-lg border border-[#19c3e6]/30 text-[#f5f5f0]/80"
                      style={{
                        background: 'rgba(15, 21, 19, 0.96)',
                        right: 0,
                      }}
                    >
                      <p className="font-semibold text-[#f5f5f0] mb-1">¿Qué es el SAP?</p>
                      <p className="mb-1">
                        SAP = <strong>Shoot Apical Point</strong> (Punto Apical del Brote).
                      </p>
                      <p className="mb-1">
                        Es una puntuación que indica qué tan conectado y relevante es un artículo dentro de la red de conocimiento del campo estudiado.
                      </p>
                      <p>
                        Un SAP alto significa que ese artículo es citado por muchos otros y conecta distintas partes del árbol.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Lista de nodos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-sm font-bold text-[#f5f5f0] uppercase tracking-widest flex items-center gap-2">
          <Layers className="h-5 w-5 text-[#19c3e6]" />
          Artículos en el Árbol
        </h2>
        <p className="text-xs text-[#f5f5f0]/60">
          {filteredNodes.length} artículos ordenados por relevancia - Click para abrir
        </p>

        {filteredNodes.length > 0 ? (
          <>
            {/* Filtros de tipo de nodo (fuera del scroll) */}
            <div className="flex gap-2 mb-3">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'leaves', label: 'Hojas' },
                { id: 'trunks', label: 'Tronco' },
                { id: 'roots', label: 'Raíces' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => {
                    setNodeFilter(btn.id);
                    setScrollOffset(0);
                    if (listContainerRef.current) {
                      listContainerRef.current.scrollTop = 0;
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                    nodeFilter === btn.id
                      ? 'bg-[#19c3e6] text-[#1a2e05] border-[#19c3e6]'
                      : 'bg-transparent text-[#f5f5f0]/70 border-[#19c3e6]/20 hover:border-[#19c3e6] hover:bg-[#19c3e6]/10'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div
              ref={listContainerRef}
              className="rounded-xl border border-[#19c3e6]/20 p-4 h-[320px] md:h-[400px]"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(12px)',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
              onScroll={(e) => setScrollOffset(e.currentTarget.scrollTop)}
            >
              <div style={{ height: `${startIndex * ITEM_HEIGHT}px` }} />

              {visibleNodes.map((node, i) =>
                renderNode(node, startIndex + i)
              )}

              <div style={{ height: `${(filteredNodes.length - endIndex) * ITEM_HEIGHT}px` }} />
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-[#f5f5f0]/60">
            <p className="text-sm">No hay nodos disponibles</p>
          </div>
        )}
      </motion.div>

      {/* Tooltip */}
      <TooltipComponent />
    </div>
  );
};

export default TreeDetail;