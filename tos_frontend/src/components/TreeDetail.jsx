import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { treeAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TreePine, 
  Calendar, 
  BookOpen, 
  ArrowLeft,
  FileJson,
  FileText,
  Network,
  Info,
  Loader2,
  ExternalLink,
  Grid3X3,
  Box,
  Layers,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { select, forceSimulation, forceManyBody, forceCollide, forceX, forceY } from 'd3';

const TreeDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [containerElement, setContainerElement] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [physicsStats, setPhysicsStats] = useState({ alpha: 0, nodes: 0, iterations: 0 });
  const [layoutStats, setLayoutStats] = useState({ roots: 0, trunks: 0, leaves: 0, total: 0 });
  
  const svgRef = useRef(null);
  const resizeObserver = useRef(null);
  const simulationRef = useRef(null);

  const { data: tree, isLoading, error } = useQuery({
    queryKey: ['tree', id],
    queryFn: () => treeAPI.detail(id).then(res => res.data),
    enabled: !!id,
  });

  const generateHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const treeStats = useMemo(() => {
    if (!tree?.arbol_json?.nodes) return { roots: 0, trunks: 0, leaves: 0, total: 0 };

    let roots = 0, trunks = 0, leaves = 0;
    
    tree.arbol_json.nodes.forEach(n => {
      const rootVal = n.root || 0;
      const trunkVal = n.trunk || 0;
      const leafVal = n.leaf || 0;
      
      if (rootVal > trunkVal && rootVal > leafVal) roots++;
      else if (trunkVal > rootVal && trunkVal > leafVal) trunks++;
      else if (leafVal > rootVal && leafVal > trunkVal) leaves++;
    });

    return { roots, trunks, leaves, total: tree.arbol_json.nodes.length };
  }, [tree?.arbol_json?.nodes?.length]);

  const processedNodes = useMemo(() => {
    if (!tree?.arbol_json?.nodes) return [];
    
    return tree.arbol_json.nodes
      .filter(n => (n.root || n.trunk || n.leaf) > 0)
      .map(d => {
        const groups = [
          { name: "leaf", value: d.leaf || 0 },
          { name: "trunk", value: d.trunk || 0 },
          { name: "root", value: d.root || 0 }
        ];
        
        const dominantGroup = groups.reduce((a, b) => a.value > b.value ? a : b).name;
        
        return {
          ...d,
          label: d.label || d.id || 'Unknown',
          group: dominantGroup,
          typeLabel: dominantGroup === 'leaf' ? 'Hoja' : dominantGroup === 'trunk' ? 'Tronco' : 'Raíz',
          hasExternalLink: !!(d.url || d.doi || d.pmid || d.arxiv_id),
          totalValue: (d.root || 0) + (d.trunk || 0) + (d.leaf || 0)
        };
      });
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
        // Calcular dimensiones más grandes para evitar cortes
        const minWidth = Math.max(rect.width, 1000);
        const minHeight = Math.max(rect.height, 700);
        
        setDimensions({ 
          width: minWidth,
          height: minHeight
        });
        return true;
      } else {
        setDimensions({ width: 1200, height: 800 });
        return true;
      }
    } catch (error) {
      setDimensions({ width: 1200, height: 800 });
      return true;
    }
  }, [containerElement]);

  useEffect(() => {
    if (!containerElement || isInitialized) return;

    measureDimensions();
    
    try {
      resizeObserver.current = new ResizeObserver(() => {
        measureDimensions();
      });
      
      resizeObserver.current.observe(containerElement);
      setIsInitialized(true);
    } catch (error) {
      // Silently handle error
    }

    return () => {
      if (resizeObserver.current) {
        try {
          resizeObserver.current.disconnect();
        } catch (error) {
          // Silently handle error
        }
        resizeObserver.current = null;
      }
    };
  }, [containerElement, measureDimensions, isInitialized]);

  const treeLayout = useMemo(() => {
    if (!processedNodes.length || !dimensions.width || !dimensions.height) {
      return { nodes: [], ready: false };
    }

    const MAX_NODES = 150;
    const nodesToRender = processedNodes.length > MAX_NODES 
      ? processedNodes
          .sort((a, b) => (b._sap || b.times_cited || 0) - (a._sap || a.times_cited || 0))
          .slice(0, MAX_NODES)
      : processedNodes;

    const maxSap = Math.max(...nodesToRender.map(n => n._sap || n.times_cited || 1));
    const baseRadius = Math.min(dimensions.width, dimensions.height) / 35;
    const radiusScale = (value) => {
      const normalized = (value - 1) / (maxSap - 1 || 1);
      return baseRadius * (0.8 + normalized * 1.5);
    };

    const colors = {
      leaf: "#4caf50",
      trunk: "#824d13", 
      root: "#ffb74d"
    };

    const coloredNodes = nodesToRender.map(node => ({
      ...node,
      radius: radiusScale(node._sap || node.times_cited || 1),
      color: colors[node.group]
    }));
    
    const stats = {
      roots: coloredNodes.filter(n => n.group === 'root').length,
      trunks: coloredNodes.filter(n => n.group === 'trunk').length,
      leaves: coloredNodes.filter(n => n.group === 'leaf').length,
      total: coloredNodes.length
    };
    setLayoutStats(stats);

    return { nodes: coloredNodes, ready: true };
  }, [processedNodes.length, dimensions, processedNodes.map(n => n.id).join('|')]);

  // SISTEMA DE FÍSICAS D3 CON MÁRGENES DINÁMICOS - VERSIÓN RESPONSIVE MEJORADA
  useEffect(() => {
    if (!treeLayout.ready || !treeLayout.nodes.length || !svgRef.current) return;

    setIsSimulating(true);
    let iterationCount = 0;

    const svg = select(svgRef.current);
    
    // Calcular márgenes dinámicos basados en el tamaño de la pantalla y número de nodos
    const minMargin = 80; // Margen mínimo más grande
    const dynamicMargin = Math.max(
      minMargin,
      Math.min(dimensions.width, dimensions.height) * 0.1 // 10% del menor lado como margen
    );
    
    const safeWidth = dimensions.width - (dynamicMargin * 2);
    const safeHeight = dimensions.height - (dynamicMargin * 2);
    
    // Inicializar nodos con posiciones dentro del área segura
    const nodes = treeLayout.nodes.map((node, index) => {
      const seed = node.id + '_init';
      const hash = generateHash(seed);
      return {
        ...node,
        // Posiciones iniciales con margen dinámico
        x: dynamicMargin + (hash % safeWidth),
        y: dynamicMargin + ((hash / 100) % safeHeight)
      };
    });

    // Definir centros objetivo más separados para mejor distribución
    const treeTopY = dynamicMargin + (safeHeight * 0.1);    // Espacio arriba para hojas
    const treeBottomY = dimensions.height - dynamicMargin - (safeHeight * 0.1); // Espacio abajo para raíces
    const treeCenterY = dimensions.height / 2;
    
    const groupCenters = {
      root: { 
        x: dimensions.width / 2, 
        y: treeBottomY  // Raíces en la base
      },
      trunk: { 
        x: dimensions.width / 2, 
        y: treeCenterY  // Tronco en el centro
      },
      leaf: { 
        x: dimensions.width / 2, 
        y: treeTopY     // Hojas en la parte superior
      }
    };

    // Configurar simulación D3 con parámetros optimizados
    const simulation = forceSimulation(nodes)
      .force("charge", forceManyBody().strength(-60)) // Repulsión más fuerte
      .force("y", forceY().y(d => groupCenters[d.group].y).strength(0.7)) // Tirón más fuerte hacia Y
      .force("x", forceX().x(d => groupCenters[d.group].x).strength(0.5)) // Tirón moderado hacia X
      .force("collide", forceCollide().radius(d => d.radius + 10).strength(1.0)) // Colisiones más fuertes con más padding
      .alpha(1)
      .alphaDecay(0.1) // Convergencia más rápida
      .alphaMin(0.001)
      .on("tick", () => {
        iterationCount++;
        const alpha = simulation.alpha();
        
        // Actualizar estadísticas
        setPhysicsStats({
          alpha: alpha,
          nodes: nodes.length,
          iterations: iterationCount
        });
        
        // Forzar que los nodos permanezcan en el área segura con margen dinámico
        nodes.forEach(d => {
          d.x = Math.max(dynamicMargin + d.radius, Math.min(dimensions.width - dynamicMargin - d.radius, d.x));
          d.y = Math.max(dynamicMargin + d.radius, Math.min(dimensions.height - dynamicMargin - d.radius, d.y));
        });
        
        // Actualizar renderizado
        svg.selectAll("circle")
          .data(nodes)
          .join(
            (enter) => enter.append("circle")
              .attr("class", d => `fill-${d.group}`)
              .attr("r", d => d.radius)
              .attr("cx", d => d.x)
              .attr("cy", d => d.y)
              .attr("fill", d => d.color)
              .attr("stroke", "#fff")
              .attr("stroke-width", "2.5")
              .style("cursor", "pointer")
              .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.15))")
              .style("transition", "all 0.1s")
              .on("mouseenter", (event, d) => handleNodeMouseEnter(d, event))
              .on("mousemove", handleNodeMouseMove)
              .on("mouseleave", handleNodeMouseLeave)
              .on("click", (event, d) => handleNodeClick(d)),
            (update) => update
              .attr("class", d => `fill-${d.group}`)
              .attr("r", d => d.radius)
              .attr("cx", d => d.x)
              .attr("cy", d => d.y)
              .attr("fill", d => d.color),
            (exit) => exit.remove()
          );
      })
      .on("end", () => {
        setIsSimulating(false);
        toast({
          title: "Simulación completada",
          description: "Física D3 responsive - todos los nodos visibles y bien organizados",
          duration: 2000,
        });
      });

    // Tiempo límite optimizado
    setTimeout(() => {
      if (simulation.running()) {
        simulation.stop();
        setIsSimulating(false);
        toast({
          title: "Simulación finalizada",
          description: "Optimización completa - layout responsive aplicado",
          duration: 2000,
        });
      }
    }, 4000); // 4 segundos máximo

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [treeLayout.ready, treeLayout.nodes.length, dimensions, toast]);

  const handleNodeMouseEnter = (node, event) => {
    setHoveredNode(node);
    setShowTooltip(true);
    updateTooltipPosition(event);
  };

  const handleNodeMouseMove = (event) => {
    updateTooltipPosition(event);
  };

  const updateTooltipPosition = (event) => {
    if (!containerElement) return;
    
    const rect = containerElement.getBoundingClientRect();
    const svgRect = svgRef.current?.getBoundingClientRect();
    
    const referenceRect = svgRect || rect;
      if (referenceRect) {
        let x = event.clientX - referenceRect.left + 15;
        let y = event.clientY - referenceRect.top - 50;
        
        // Límites del container
        const tooltipWidth = 280;
        const tooltipHeight = 100;
        
        // Ajustar si se sale por la derecha
        if (x + tooltipWidth > rect.width) {
          x = event.clientX - referenceRect.left - tooltipWidth - 15;
        }
        
        // Ajustar si se sale por arriba
        if (y < 0) {
          y = event.clientY - referenceRect.top + 15;
        }
        
        // Ajustar si se sale por la izquierda
        if (x < 0) {
          x = 15;
        }
        
        setTooltipPosition({ x, y });
      }
  };

  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
    setShowTooltip(false);
  };

  const handleNodeClick = (node) => {
    let url = null;
    
    if (node.url) {
      url = node.url;
    } else if (node.doi) {
      url = `https://doi.org/${node.doi}`;
    } else if (node.pmid) {
      url = `https://pubmed.ncbi.nlm.nih.gov/${node.pmid}`;
    } else if (node.arxiv_id) {
      url = `https://arxiv.org/abs/${node.arxiv_id}`;
    }
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Abriendo documento",
        description: `${node.label}`,
        duration: 2000,
      });
    } else {
      toast({
        title: "Documento no disponible",
        description: "Este nodo no tiene un enlace asociado",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const restartSimulation = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.restart();
    }
  }, []);

  const downloadTreeMutation = useMutation({
    mutationFn: ({ format }) => treeAPI.download(id, format),
    onSuccess: (response, { format }) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tree?.title || `arbol_${id}`}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Descarga iniciada",
        description: `El archivo ${format.toUpperCase()} se está descargando.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Función para generar y descargar JSON con los nodos procesados
const handleDownloadJSON = () => {
  try {
    const exportData = {
      metadata: {
        tree_id: tree.id,
        tree_title: tree.title,
        export_date: new Date().toISOString(),
        total_nodes_shown: processedNodes.length,
        total_nodes_in_tree: treeStats.total,
        visualization: "Física D3 Responsive"
      },
      statistics: layoutStats,
      nodes: processedNodes.map(node => ({
        // Información básica del nodo
        id: node.id,
        label: node.label,
        group: node.group,
        type_label: node.typeLabel,
        
        // Valores de clasificación
        root: node.root || 0,
        trunk: node.trunk || 0,
        leaf: node.leaf || 0,
        total_value: node.totalValue || 0,
        
        // Información del artículo
        authors: node.authors || node.author || 'N/A',
        year: node.year || node.fecha || 'N/A',
        title: node.label,
        
        // Enlaces y identificadores
        doi: node.doi || null,
        pmid: node.pmid || null,
        arxiv_id: node.arxiv_id || null,
        url: node.url || null,
        
        // Métricas
        sap: node._sap || null,
        times_cited: node.times_cited || null,
        has_external_link: node.hasExternalLink
      }))
    };

    // Crear y descargar el archivo JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${tree?.title || `arbol_${id}`}_nodos_visualizados.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast({
        title: "Descarga iniciada",
        description: `JSON con ${processedNodes.length} nodos visualizados descargado`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error al generar JSON:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el archivo JSON",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-600">Cargando árbol...</p>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    try {
      // Crear contenido HTML para el PDF
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Árbol - ${tree.title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #4caf50;
              padding-bottom: 15px;
            }
            .title { 
              font-size: 24px; 
              font-weight: bold; 
              color: #2c3e50;
              margin: 0;
            }
            .subtitle { 
              color: #666; 
              font-size: 14px;
              margin: 5px 0;
            }
            .stats {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 15px;
            }
            .stat-item {
              text-align: center;
              padding: 10px;
              background: white;
              border-radius: 6px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .stat-number {
              font-size: 20px;
              font-weight: bold;
              color: #2c3e50;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
            }
            .article {
              margin-bottom: 20px;
              padding: 15px;
              border-left: 4px solid #4caf50;
              background: #f8f9fa;
              page-break-inside: avoid;
            }
            .article.root { border-left-color: #ffb74d; }
            .article.trunk { border-left-color: #824d13; }
            .article.leaf { border-left-color: #4caf50; }
            .article-title {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 8px;
              color: #2c3e50;
            }
            .article-meta {
              font-size: 12px;
              color: #666;
              margin-bottom: 8px;
            }
            .article-values {
              display: flex;
              gap: 10px;
              flex-wrap: wrap;
            }
            .badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: bold;
            }
            .badge.root { background: #ffb74d; color: white; }
            .badge.trunk { background: #824d13; color: white; }
            .badge.leaf { background: #4caf50; color: white; }
            .badge.cites { background: #2196f3; color: white; }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #999;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${tree.title || `Árbol ${tree.id}`}</h1>
            <p class="subtitle">Artículos del Árbol - ${processedNodes.length} nodos visualizados</p>
            <p class="subtitle">Generado: ${new Date().toLocaleDateString('es-CO')}</p>
          </div>

          <div class="stats">
            <h3 style="margin-top: 0; color: #2c3e50;">Estadísticas del Árbol</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">${treeStats.total}</div>
                <div class="stat-label">Total Nodos</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${treeStats.leaves}</div>
                <div class="stat-label">Hojas (Copa)</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${treeStats.trunks}</div>
                <div class="stat-label">Tronco (Centro)</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${treeStats.roots}</div>
                <div class="stat-label">Raíces (Base)</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${processedNodes.length}</div>
                <div class="stat-label">Nodos Procesados</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">D3</div>
                <div class="stat-label">Sistema Física</div>
              </div>
            </div>
          </div>

          <h3 style="color: #2c3e50; margin-top: 30px;">Artículos</h3>
          
          ${processedNodes.slice(0, 100).map(node => {
            const year = node.year || node.fecha || 'N/A';
            const doi = node.doi ? `DOI: ${node.doi}` : '';
            const pmid = node.pmid ? `PMID: ${node.pmid}` : '';
            const arxiv = node.arxiv_id ? `arXiv: ${node.arxiv_id}` : '';
            
            return `
              <div class="article ${node.group}">
                <div class="article-title">${node.label || 'Título no disponible'}</div>
                <div class="article-meta">
                  <strong>Año:</strong> ${year} | <strong>Tipo:</strong> ${node.typeLabel}
                  ${doi ? `<br>${doi}` : ''}
                  ${pmid ? `<br>${pmid}` : ''}
                  ${arxiv ? `<br>${arxiv}` : ''}
                </div>
                <div class="article-values">
                  ${node.root > 0 ? `<span class="badge root">Raíz: ${node.root}</span>` : ''}
                  ${node.trunk > 0 ? `<span class="badge trunk">Tronco: ${node.trunk}</span>` : ''}
                  ${node.leaf > 0 ? `<span class="badge leaf">Hoja: ${node.leaf}</span>` : ''}
                  ${(node._sap || node.times_cited) ? `<span class="badge cites">Citas: ${node._sap || node.times_cited}</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
          
          ${processedNodes.length > 100 ? `
            <div style="text-align: center; margin: 20px 0; font-style: italic; color: #666;">
              Mostrando 100 de ${processedNodes.length} artículos
            </div>
          ` : ''}

          <div class="footer">
            <p>Generado con Física D3 Responsive | ${new Date().toLocaleString('es-CO')}</p>
          </div>
        </body>
        </html>
      `;

      // Crear y abrir el PDF en una nueva ventana
      const pdfWindow = window.open('', '_blank');
      if (pdfWindow) {
        pdfWindow.document.write(pdfContent);
        pdfWindow.document.close();
        
        // Dar tiempo para que se renderice el contenido
        setTimeout(() => {
          pdfWindow.print();
        }, 500);
        
        toast({
          title: "PDF generado",
          description: "Ventana de impresión abierta - Guardar como PDF",
          duration: 3000,
        });
      } else {
        throw new Error('No se pudo abrir la ventana para el PDF');
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (error || !tree) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TreePine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Árbol no encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                El árbol solicitado no existe o no tiene permisos para verlo.
              </p>
              <Button asChild>
                <Link to="/history">Volver al historial</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {tree.title || `Árbol ${tree.id}`}
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Física D3 responsive: márgenes dinámicos, sin cortes, adaptación automática al tamaño
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={restartSimulation}
            disabled={!treeLayout.nodes.length}
          >
            <Zap className="mr-2 h-4 w-4" />
            Reiniciar Física
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJSON}
            disabled={downloadTreeMutation.isPending}
          >
            <FileJson className="mr-2 h-4 w-4" />
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={downloadTreeMutation.isPending}
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <Card className={isSimulating ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span className={isSimulating ? "text-blue-800" : "text-green-800"}>
              {isSimulating ? "⚡ Física D3 Responsive" : "✅ Física D3 Responsive Completada"}
            </span>
            {isSimulating && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-xs space-y-1 ${isSimulating ? "text-blue-700" : "text-green-700"}`}>
            <div>Dimensiones: {Math.round(dimensions.width)} × {Math.round(dimensions.height)}px</div>
            <div>Nodos: {layoutStats.total}</div>
            <div>Alpha: {physicsStats.alpha.toFixed(3)}</div>
            <div>Iteraciones: {physicsStats.iterations}</div>
            <div>Márgenes: {Math.round(Math.max(80, Math.min(dimensions.width, dimensions.height) * 0.1))}px dinámicos</div>
            <div>Raíces: {layoutStats.roots} | Tronco: {layoutStats.trunks} | Hojas: {layoutStats.leaves}</div>
            <div>Estado: {isSimulating ? "Aplicando layout responsive..." : "Layout responsive aplicado"}</div>
            {!isSimulating && (
              <div className="mt-2 text-green-800 font-medium">
                ✅ Todos los nodos visibles - Sin cortes, sin superposiciones
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
        <div className="xl:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Info className="mr-2 h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de Generación</label>
                <div className="flex items-center mt-1">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(tree.fecha_generado)}</span>
                </div>
              </div>

              {tree.bibliography && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Bibliografía</label>
                  <div className="flex items-center mt-1">
                    <BookOpen className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="text-sm">{tree.bibliography.nombre_archivo}</span>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-600">Semilla Original</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">{tree.seed}</p>
                </div>
              </div>

              {tree.arbol_json?.metadata && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Metadatos</label>
                    <div className="mt-1 space-y-2">
                      {tree.arbol_json.metadata.algorithm_version && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Versión:</span>
                          <span className="font-medium">{tree.arbol_json.metadata.algorithm_version}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total de nodos:</span>
                        <span className="font-medium">{treeStats.total}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Network className="mr-2 h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#4caf50] mr-2 flex items-center justify-center">
                      <Layers className="w-2 h-2 text-white" />
                    </div>
                    Hojas (copa)
                  </span>
                  <span className="text-sm font-medium">{treeStats.leaves}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#824d13] mr-2 flex items-center justify-center">
                      <Box className="w-2 h-2 text-white" />
                    </div>
                    Tronco (centro)
                  </span>
                  <span className="text-sm font-medium">{treeStats.trunks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-[#ffb74d] mr-2"></span>
                    Raíces (base)
                  </span>
                  <span className="text-sm font-medium">{treeStats.roots}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Física D3 Responsive - Versión 3.0
                  </p>
                  <p className="text-xs text-blue-700 space-y-1">
                    <span className="block">🔄 Márgenes dinámicos (80px + 10% del lado menor)</span>
                    <span className="block">🔄 Adaptación automática al tamaño de pantalla</span>
                    <span className="block">🔄 Repulsión optimizada (-60)</span>
                    <span className="block">🔄 Colisiones con +10px padding</span>
                    <span className="block">🔄 Convergencia rápida (0.1 decay)</span>
                    <span className="block">🔄 Áreas reservadas arriba y abajo para grupos</span>
                    <span className="block">🔄 100% de nodos siempre visibles</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg flex-wrap gap-2">
                <div className="flex items-center">
                  <TreePine className="mr-2 h-5 w-5"/>
                  Árbol Responsive - Márgenes Dinámicos
                  {isSimulating && (
                    <Badge variant="default" className="ml-2 animate-pulse bg-blue-500">
                      <Zap className="mr-1 h-3 w-3" />
                      Optimizando
                    </Badge>
                  )}
                </div>
                {processedNodes.length > 150 && (
                  <Badge variant="secondary" className="text-xs">
                    Mostrando 150 de {processedNodes.length} nodos
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Física D3 con márgenes dinámicos: se adapta automáticamente al tamaño de pantalla para garantizar que todos los nodos sean siempre visibles
              </CardDescription>
            </CardHeader>
            <CardContent className="relative p-0">
              <div 
                ref={containerRefCallback}
                className="tree-visualization w-full h-full min-h-[600px] relative"
                style={{
                  backgroundColor: "#fefefe",
                  borderRadius: "8px",
                  overflow: "hidden",
                  minHeight: "600px",
                  border: "1px solid #e5e7eb"
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full"
                  ref={svgRef}
                />
                
                {showTooltip && hoveredNode && (
                  <div
                    className="absolute pointer-events-none z-20 bg-white/95 border border-gray-200 rounded-lg p-3 shadow-lg max-w-xs"
                    style={{
                      left: tooltipPosition.x,
                      top: tooltipPosition.y,
                      backdropFilter: 'blur(8px)',
                      transform: 'translate(0, 0)',
                      willChange: 'auto'
                    }}
                  >
                    <div className="text-xs">
                      <div className="font-semibold text-gray-800 mb-1">
                        {hoveredNode.typeLabel}
                      </div>
                      <div className="text-gray-600 mb-2">
                        <strong>{hoveredNode.label}</strong>
                      </div>
                      <div className="text-gray-600 text-xs">
                        Hoja: {hoveredNode.leaf || 0} | Tronco: {hoveredNode.trunk || 0} | Raíz: {hoveredNode.root || 0}<br/>
                        Total: {hoveredNode.totalValue || 0} puntos
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BookOpen className="mr-2 h-5 w-5" />
                Artículos del Árbol
              </CardTitle>
              <CardDescription>
                Información detallada de los {processedNodes.length} artículos visualizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {processedNodes.slice(0, 30).map((node, index) => {
                  // Extraer información del artículo
                  const getArticleType = () => {
                    if (node.doi) return 'Artículo DOI';
                    if (node.pmid) return 'PubMed';
                    if (node.arxiv_id) return 'arXiv';
                    return 'Artículo';
                  };

                  const getYear = () => {
                    return node.year || node.fecha || 'N/A';
                  };

                  const getLink = () => {
                    if (node.doi) return `https://doi.org/${node.doi}`;
                    if (node.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${node.pmid}`;
                    if (node.arxiv_id) return `https://arxiv.org/abs/${node.arxiv_id}`;
                    if (node.url) return node.url;
                    return null;
                  };

                  const link = getLink();

                  return (
                    <div 
                      key={`${node.id}-${index}`}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: node.group === 'root' ? '#ffb74d' : 
                                        node.group === 'trunk' ? '#824d13' : '#4caf50'
                      }}
                    >
                      <div className="space-y-2">
                        {/* Título */}
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 leading-tight flex-1">
                            {node.label || 'Título no disponible'}
                          </h4>
                          {link && (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:text-blue-800 flex-shrink-0"
                              title="Abrir artículo"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>

                        {/* Año y Tipo */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span><strong>Año:</strong> {getYear()}</span>
                          <span><strong>Tipo:</strong> {getArticleType()}</span>
                          <span className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                              node.group === 'root' ? 'bg-[#ffb74d]' : 
                              node.group === 'trunk' ? 'bg-[#824d13]' : 'bg-[#4caf50]'
                            }`}></span>
                            {node.typeLabel}
                          </span>
                        </div>

                        {/* Valores de clasificación */}
                        <div className="flex flex-wrap gap-2">
                          {node.root > 0 && (
                            <Badge variant="outline" className="text-xs bg-[#ffb74d]/10 text-[#ffb74d] border-[#ffb74d]">
                              Raíz: {node.root}
                            </Badge>
                          )}
                          {node.trunk > 0 && (
                            <Badge variant="outline" className="text-xs bg-[#824d13]/10 text-[#824d13] border-[#824d13]">
                              Tronco: {node.trunk}
                            </Badge>
                          )}
                          {node.leaf > 0 && (
                            <Badge variant="outline" className="text-xs bg-[#4caf50]/10 text-[#4caf50] border-[#4caf50]">
                              Hoja: {node.leaf}
                            </Badge>
                          )}
                          {node._sap || node.times_cited ? (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Citas: {node._sap || node.times_cited}
                            </Badge>
                          ) : null}
                        </div>

                        {/* DOI/ID específico si existe */}
                        {node.doi && (
                          <div className="text-xs text-gray-500">
                            <strong>DOI:</strong> {node.doi}
                          </div>
                        )}
                        {node.pmid && (
                          <div className="text-xs text-gray-500">
                            <strong>PMID:</strong> {node.pmid}
                          </div>
                        )}
                        {node.arxiv_id && (
                          <div className="text-xs text-gray-500">
                            <strong>arXiv ID:</strong> {node.arxiv_id}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {processedNodes.length > 30 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Mostrando 30 de {processedNodes.length} artículos
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleDownload('json')}
                      disabled={downloadTreeMutation.isPending}
                    >
                      <FileJson className="mr-2 h-4 w-4" />
                      Descargar JSON Completo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TreeDetail;