"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { X, Search as SearchIcon, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import { zoom, zoomIdentity, type ZoomTransform } from "d3-zoom";
import { select } from "d3-selection";
import { knowledgeGraphData, type KGNode, type KGLink } from "@/lib/data/knowledge-graph";
import { useIsMobile } from "@/hooks/use-mobile";

interface SimNode extends SimulationNodeDatum, KGNode {}
interface SimLink extends SimulationLinkDatum<SimNode> {
  type: KGLink["type"];
  label: string;
}

// Neon wireframe color scheme — more differentiated
const GROUP_COLORS: Record<string, string> = {
  architecture: "#f59e0b", // amber
  technology: "#06b6d4",   // cyan
  concept: "#a855f7",      // purple
  decision: "#ef4444",     // red
};
const GROUP_GLOWS: Record<string, string> = {
  architecture: "rgba(245,158,11,0.4)",
  technology: "rgba(6,182,212,0.4)",
  concept: "rgba(168,85,247,0.4)",
  decision: "rgba(239,68,68,0.4)",
};
const GROUP_LABELS: Record<string, string> = {
  architecture: "아키텍처",
  technology: "기술",
  concept: "개념",
  decision: "의사결정",
};

export default function KGExplorer() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileListView /> : <ForceGraphView />;
}

function MobileListView() {
  const [selectedNode, setSelectedNode] = useState<KGNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const groups = ["architecture", "technology", "concept", "decision"] as const;

  const filteredNodes = knowledgeGraphData.nodes.filter(
    (n) => !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.includes(searchQuery)
  );

  return (
    <div className="space-y-4 p-5 md:p-8">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold">KG 탐색기</h1>
        <span className="text-xs text-muted-foreground">{knowledgeGraphData.nodes.length}개 노드</span>
      </div>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="노드 검색..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-[var(--forge-border)] bg-[var(--forge-surface)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
      </div>
      {filteredNodes.length === 0 ? (
        <div className="rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-8 text-center">
          <p className="text-sm text-muted-foreground">일치하는 노드가 없습니다</p>
          <button onClick={() => setSearchQuery("")} className="mt-2 text-xs text-primary hover:underline">전체 보기</button>
        </div>
      ) : (
        groups.map((group) => {
          const groupNodes = filteredNodes.filter((n) => n.group === group);
          if (groupNodes.length === 0) return null;
          return (
            <div key={group}>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GROUP_COLORS[group] }} />
                {GROUP_LABELS[group]} ({groupNodes.length})
              </h3>
              <div className="space-y-1.5">
                {groupNodes.map((node) => (
                  <button key={node.id}
                    onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                      selectedNode?.id === node.id ? "border-primary/30 bg-primary/5" : "border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] hover:border-[var(--forge-border)]"
                    }`}>
                    <span className="font-semibold">{node.label}</span>
                    {selectedNode?.id === node.id && (
                      <div className="mt-2">
                        <p className="text-xs leading-relaxed text-muted-foreground">{node.description}</p>
                        {node.relatedStudy && <Link href={`/study/${node.relatedStudy}`} className="mt-1 block text-xs text-primary hover:underline">관련 학습 자료 →</Link>}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// Pill node dimensions
function getNodeSize(node: SimNode) {
  const charWidth = node.group === "architecture" ? 9 : 7.5;
  const w = Math.max(60, node.label.length * charWidth + 28);
  const h = node.group === "architecture" ? 32 : 26;
  return { w, h };
}

function ForceGraphView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [links, setLinks] = useState<SimLink[]>([]);
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

  const colorScale = useCallback((group: string) => GROUP_COLORS[group] || "#f59e0b", []);

  // Connected node IDs for focus effect
  const connectedIds = useMemo(() => {
    const active = selectedNode?.id || hoveredNode;
    if (!active) return null;
    const ids = new Set<string>([active]);
    knowledgeGraphData.links.forEach((l) => {
      if (l.source === active || (typeof l.source === "object" && (l.source as SimNode).id === active)) {
        const tid = typeof l.target === "string" ? l.target : (l.target as SimNode).id;
        ids.add(tid);
      }
      if (l.target === active || (typeof l.target === "object" && (l.target as SimNode).id === active)) {
        const sid = typeof l.source === "string" ? l.source : (l.source as SimNode).id;
        ids.add(sid);
      }
    });
    return ids;
  }, [selectedNode, hoveredNode]);

  // Track container size
  useEffect(() => {
    function update() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ w: rect.width, h: rect.height });
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Initialize simulation
  useEffect(() => {
    const cx = dimensions.w / 2;
    const cy = dimensions.h / 2;
    const simNodes: SimNode[] = knowledgeGraphData.nodes.map((n) => ({ ...n }));
    const simLinks: SimLink[] = knowledgeGraphData.links.map((l) => ({
      source: l.source, target: l.target, type: l.type, label: l.label,
    }));

    // Link distance varies by relationship type
    const linkDistance = (link: SimLink) => {
      switch (link.type) {
        case "part_of": return 80;    // tightly coupled
        case "uses": return 100;
        case "enables": return 120;
        case "evolves_to": return 140;
        case "compares": return 160;  // alternatives spread apart
        default: return 120;
      }
    };

    // Group clustering — nudge nodes toward quadrants by group
    const groupTargetX: Record<string, number> = {
      architecture: cx - cx * 0.15,
      technology: cx + cx * 0.25,
      concept: cx - cx * 0.2,
      decision: cx + cx * 0.15,
    };
    const groupTargetY: Record<string, number> = {
      architecture: cy - cy * 0.2,
      technology: cy + cy * 0.15,
      concept: cy + cy * 0.2,
      decision: cy - cy * 0.25,
    };

    const sim = forceSimulation(simNodes)
      .force("link", forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(linkDistance))
      .force("charge", forceManyBody().strength(-600))
      .force("center", forceCenter(cx, cy).strength(0.05))
      .force("collide", forceCollide<SimNode>((d) => getNodeSize(d).w / 2 + 8))
      .force("x", forceX<SimNode>((d) => groupTargetX[d.group] || cx).strength(0.04))
      .force("y", forceY<SimNode>((d) => groupTargetY[d.group] || cy).strength(0.04))
      .alphaDecay(0.02)
      .on("tick", () => {
        setNodes([...simNodes]);
        setLinks([...simLinks]);
      });

    return () => { sim.stop(); };
  }, [dimensions.w, dimensions.h]);

  // Setup zoom
  useEffect(() => {
    if (!svgRef.current) return;
    const svgEl = select(svgRef.current);
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => setTransform(event.transform));
    svgEl.call(zoomBehavior);
    return () => { svgEl.on(".zoom", null); };
  }, []);

  const filteredNodeIds = searchQuery
    ? new Set(knowledgeGraphData.nodes
        .filter((n) => n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.includes(searchQuery))
        .map((n) => n.id))
    : null;

  // Is a link connected to the active (selected/hovered) node?
  const isLinkActive = useCallback((link: SimLink) => {
    if (!connectedIds) return false;
    const sid = typeof link.source === "string" ? link.source : (link.source as SimNode).id;
    const tid = typeof link.target === "string" ? link.target : (link.target as SimNode).id;
    const active = selectedNode?.id || hoveredNode;
    return (sid === active || tid === active);
  }, [connectedIds, selectedNode, hoveredNode]);

  return (
    <div className="relative flex" style={{ height: "calc(100vh - 57px)" }}>
      <div ref={containerRef} className="relative flex-1 overflow-hidden" style={{ background: "#08080a" }}>

        {/* SVG defs for glows and arrows */}
        <svg className="absolute h-0 w-0">
          <defs>
            {Object.entries(GROUP_COLORS).map(([group, color]) => (
              <filter key={group} id={`glow-${group}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor={color} floodOpacity="0.6" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            ))}
            <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" opacity="0.3" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" opacity="0.8" />
            </marker>
          </defs>
        </svg>

        {/* Floating search bar */}
        <div className="absolute left-4 top-4 z-20">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="노드 검색..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 rounded-lg border border-white/10 bg-black/60 py-2 pl-9 pr-8 text-xs text-white outline-none backdrop-blur-xl focus:border-amber-500/50" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="h-3 w-3 text-white/50" />
              </button>
            )}
          </div>
        </div>

        {/* Floating zoom controls */}
        <div className="absolute right-4 top-4 z-20 flex flex-col gap-1">
          {[
            { icon: ZoomIn, action: () => setTransform((p) => zoomIdentity.translate(p.x, p.y).scale(p.k * 1.3)) },
            { icon: ZoomOut, action: () => setTransform((p) => zoomIdentity.translate(p.x, p.y).scale(p.k * 0.7)) },
            { icon: Maximize2, action: () => setTransform(zoomIdentity) },
          ].map(({ icon: Icon, action }, i) => (
            <button key={i} onClick={action}
              className="rounded-lg border border-white/10 bg-black/60 p-2 backdrop-blur-xl transition-colors hover:border-amber-500/30 hover:bg-black/80">
              <Icon className="h-3.5 w-3.5 text-white/70" />
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-20 rounded-lg border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-xl">
          <div className="flex gap-4">
            {Object.entries(GROUP_LABELS).map(([g, label]) => (
              <div key={g} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: GROUP_COLORS[g], boxShadow: `0 0 6px ${GROUP_GLOWS[g]}` }} />
                <span className="text-[0.6rem] text-white/50">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hint */}
        {!selectedNode && !hoveredNode && nodes.length > 0 && (
          <div className="absolute bottom-4 right-4 z-20 rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-[0.6rem] text-white/40 backdrop-blur-xl">
            노드를 클릭하여 탐색 · 드래그로 이동 · 스크롤로 줌
          </div>
        )}

        {/* Main SVG */}
        <svg ref={svgRef} width="100%" height="100%" className="cursor-grab active:cursor-grabbing">
          {/* Grid pattern background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.3" opacity="0.04" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
            {/* Links — curved bezier with arrows */}
            {links.map((link, i) => {
              const source = link.source as SimNode;
              const target = link.target as SimNode;
              if (!source.x || !source.y || !target.x || !target.y) return null;

              const searchDimmed = filteredNodeIds && (!filteredNodeIds.has(source.id) || !filteredNodeIds.has(target.id));
              const active = isLinkActive(link);
              const focusDimmed = connectedIds && !active;
              const dimmed = searchDimmed || focusDimmed;

              // Curved path
              const dx = target.x - source.x;
              const dy = target.y - source.y;
              const dr = Math.sqrt(dx * dx + dy * dy) * 0.6;

              // Shorten line to not overlap pill nodes
              const sSize = getNodeSize(source);
              const tSize = getNodeSize(target);
              const angle = Math.atan2(dy, dx);
              const sx = source.x + Math.cos(angle) * (sSize.w / 2 + 4);
              const sy = source.y + Math.sin(angle) * (sSize.h / 2 + 4);
              const tx = target.x - Math.cos(angle) * (tSize.w / 2 + 4);
              const ty = target.y - Math.sin(angle) * (tSize.h / 2 + 4);

              return (
                <g key={i}>
                  <path
                    d={`M${sx},${sy} A${dr},${dr} 0 0,1 ${tx},${ty}`}
                    fill="none"
                    stroke={active ? GROUP_COLORS[source.group] || "#f59e0b" : "white"}
                    strokeWidth={active ? 1.5 : 0.8}
                    strokeOpacity={dimmed ? 0.03 : active ? 0.5 : 0.08}
                    markerEnd={active ? "url(#arrow-active)" : "url(#arrow)"}
                  />
                  {/* Edge label on hover/select */}
                  {active && !dimmed && (
                    <text
                      x={(sx + tx) / 2 + (dy > 0 ? -8 : 8)}
                      y={(sy + ty) / 2 + (dx > 0 ? 8 : -8)}
                      textAnchor="middle"
                      fontSize={8}
                      fill={GROUP_COLORS[source.group] || "#f59e0b"}
                      fillOpacity={0.7}
                      fontWeight={600}
                    >
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes — pill shaped with neon glow */}
            {nodes.map((node) => {
              if (node.x === undefined || node.y === undefined) return null;
              const { w, h } = getNodeSize(node);
              const color = colorScale(node.group);
              const glow = GROUP_GLOWS[node.group] || GROUP_GLOWS.architecture;
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode === node.id;
              const isActive = isSelected || isHovered;
              const searchDimmed = filteredNodeIds && !filteredNodeIds.has(node.id);
              const focusDimmed = connectedIds && !connectedIds.has(node.id);
              const dimmed = searchDimmed || focusDimmed;
              const isCenter = node.id === "athena";
              const rx = h / 2;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer"
                  opacity={dimmed ? 0.08 : 1}
                  style={{ transition: "opacity 0.3s ease" }}
                >
                  {/* Outer glow for active/center */}
                  {(isActive || isCenter) && (
                    <rect
                      x={-w / 2 - 4} y={-h / 2 - 4}
                      width={w + 8} height={h + 8}
                      rx={rx + 4}
                      fill="none"
                      stroke={color}
                      strokeWidth={isCenter && !isActive ? 0.5 : 1.5}
                      strokeOpacity={isCenter && !isActive ? 0.15 : 0.3}
                      style={{ filter: `drop-shadow(0 0 ${isActive ? 12 : 6}px ${glow})` }}
                    >
                      {isCenter && !isActive && (
                        <animate attributeName="stroke-opacity" values="0.15;0.35;0.15" dur="3s" repeatCount="indefinite" />
                      )}
                    </rect>
                  )}

                  {/* Pill body */}
                  <rect
                    x={-w / 2} y={-h / 2}
                    width={w} height={h}
                    rx={rx}
                    fill={isActive ? color : "#0f0f12"}
                    fillOpacity={isActive ? 0.2 : 0.8}
                    stroke={color}
                    strokeWidth={isActive ? 1.5 : 0.8}
                    strokeOpacity={isActive ? 0.8 : 0.25}
                    style={isActive ? { filter: `drop-shadow(0 0 8px ${glow})` } : undefined}
                  />

                  {/* Label */}
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    fill={isActive ? color : "white"}
                    fontSize={node.group === "architecture" ? 10 : 8}
                    fontWeight={isActive || node.group === "architecture" ? 700 : 500}
                    fontFamily="var(--font-sora), system-ui, sans-serif"
                    letterSpacing="0.02em"
                    opacity={0.9}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Detail Panel */}
      {selectedNode && (
        <div className="w-80 shrink-0 overflow-y-auto border-l border-white/5 bg-[#0c0c0f] p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold" style={{ color: colorScale(selectedNode.group) }}>{selectedNode.label}</h3>
              <span className="mt-1 inline-block rounded-md px-2 py-0.5 text-[0.6rem] font-semibold"
                style={{ backgroundColor: `${colorScale(selectedNode.group)}15`, color: colorScale(selectedNode.group) }}>
                {GROUP_LABELS[selectedNode.group]}
              </span>
            </div>
            <button onClick={() => setSelectedNode(null)} className="rounded-lg p-1 transition-colors hover:bg-white/5">
              <X className="h-4 w-4 text-white/40" />
            </button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-white/60">{selectedNode.description}</p>

          {selectedNode.relatedStudy && (
            <Link href={`/study/${selectedNode.relatedStudy}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium hover:underline"
              style={{ color: colorScale(selectedNode.group) }}>
              관련 학습 자료 →
            </Link>
          )}

          <div className="mt-6">
            <h4 className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-white/30">연결된 노드</h4>
            <div className="space-y-0.5">
              {knowledgeGraphData.links
                .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                .slice(0, 10)
                .map((l, i) => {
                  const otherId = l.source === selectedNode.id ? l.target : l.source;
                  const otherNode = knowledgeGraphData.nodes.find((n) => n.id === otherId);
                  return (
                    <button key={i}
                      onClick={() => { const found = nodes.find((n) => n.id === otherId); if (found) setSelectedNode(found); }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[0.65rem] transition-colors hover:bg-white/5">
                      <span className="shrink-0 rounded-sm px-1.5 py-0.5 text-[0.55rem] font-semibold"
                        style={{ backgroundColor: `${colorScale(selectedNode.group)}15`, color: colorScale(selectedNode.group) }}>
                        {l.label}
                      </span>
                      <span className="text-white/50">→ {otherNode?.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
