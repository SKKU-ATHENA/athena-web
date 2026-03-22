"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { X, Search as SearchIcon, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import { zoom, zoomIdentity, type ZoomTransform } from "d3-zoom";
import { select } from "d3-selection";
import { scaleOrdinal } from "d3-scale";
import { knowledgeGraphData, type KGNode, type KGLink } from "@/lib/data/knowledge-graph";
import { useIsMobile } from "@/hooks/use-mobile";

interface SimNode extends SimulationNodeDatum, KGNode {}
interface SimLink extends SimulationLinkDatum<SimNode> {
  type: KGLink["type"];
  label: string;
}

const GROUP_COLORS = ["#f59e0b", "#d97706", "#fbbf24", "#b45309"];
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
        <input
          type="text"
          placeholder="노드 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-[var(--forge-border)] bg-[var(--forge-surface)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
        />
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
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {GROUP_LABELS[group]} ({groupNodes.length})
              </h3>
              <div className="space-y-1.5">
                {groupNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                      selectedNode?.id === node.id
                        ? "border-primary/30 bg-primary/5"
                        : "border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] hover:border-[var(--forge-border)]"
                    }`}
                  >
                    <span className="font-semibold">{node.label}</span>
                    {selectedNode?.id === node.id && (
                      <div className="mt-2">
                        <p className="text-xs leading-relaxed text-muted-foreground">{node.description}</p>
                        {node.relatedStudy && (
                          <Link href={`/study/${node.relatedStudy}`} className="mt-1 block text-xs text-primary hover:underline">
                            관련 학습 자료 →
                          </Link>
                        )}
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

function ForceGraphView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [links, setLinks] = useState<SimLink[]>([]);
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

  const colorScale = scaleOrdinal<string>().domain(Object.keys(GROUP_LABELS)).range(GROUP_COLORS);

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
      source: l.source,
      target: l.target,
      type: l.type,
      label: l.label,
    }));

    const sim = forceSimulation(simNodes)
      .force("link", forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(100))
      .force("charge", forceManyBody().strength(-300))
      .force("center", forceCenter(cx, cy))
      .force("collide", forceCollide(35))
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

  const getNodeRadius = useCallback((node: SimNode) => {
    const connections = knowledgeGraphData.links.filter(
      (l) => l.source === node.id || l.target === node.id
    ).length;
    return Math.max(20, 14 + connections * 2.5);
  }, []);

  const filteredNodeIds = searchQuery
    ? new Set(
        knowledgeGraphData.nodes
          .filter((n) => n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.includes(searchQuery))
          .map((n) => n.id)
      )
    : null;

  return (
    <div className="relative flex" style={{ height: "calc(100vh - 57px)" }}>
      {/* Graph area — fills everything */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden bg-[var(--forge-surface)]">
        {/* Floating search bar */}
        <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="노드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 rounded-lg border border-[var(--forge-border)] bg-background/90 py-2 pl-9 pr-8 text-xs outline-none backdrop-blur-md focus:border-primary"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Floating zoom controls */}
        <div className="absolute right-4 top-4 z-20 flex flex-col gap-1">
          <button
            onClick={() => setTransform((p) => zoomIdentity.translate(p.x, p.y).scale(p.k * 1.3))}
            className="rounded-lg border border-[var(--forge-border)] bg-background/90 p-2 backdrop-blur-md transition-colors hover:border-primary/30"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTransform((p) => zoomIdentity.translate(p.x, p.y).scale(p.k * 0.7))}
            className="rounded-lg border border-[var(--forge-border)] bg-background/90 p-2 backdrop-blur-md transition-colors hover:border-primary/30"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTransform(zoomIdentity)}
            className="rounded-lg border border-[var(--forge-border)] bg-background/90 p-2 backdrop-blur-md transition-colors hover:border-primary/30"
            title="리셋"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-20 flex gap-3 rounded-lg bg-background/80 px-3 py-2 backdrop-blur-md">
          {Object.entries(GROUP_LABELS).map(([g, label], i) => (
            <div key={g} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GROUP_COLORS[i] }} />
              <span className="text-[0.6rem] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Hint */}
        {!selectedNode && nodes.length > 0 && (
          <div className="absolute bottom-4 right-4 z-20 rounded-lg bg-background/80 px-3 py-2 text-[0.6rem] text-muted-foreground backdrop-blur-md">
            노드를 클릭하여 탐색 · 드래그로 이동 · 스크롤로 줌
          </div>
        )}

        {/* SVG Graph */}
        <svg ref={svgRef} width="100%" height="100%" className="cursor-grab active:cursor-grabbing">
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
            {/* Links */}
            {links.map((link, i) => {
              const source = link.source as SimNode;
              const target = link.target as SimNode;
              if (!source.x || !source.y || !target.x || !target.y) return null;
              const dimmed = filteredNodeIds && (!filteredNodeIds.has(source.id) || !filteredNodeIds.has(target.id));
              return (
                <line
                  key={i}
                  x1={source.x} y1={source.y} x2={target.x} y2={target.y}
                  stroke="currentColor"
                  strokeWidth={1}
                  opacity={dimmed ? 0.03 : 0.12}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              if (node.x === undefined || node.y === undefined) return null;
              const r = getNodeRadius(node);
              const dimmed = filteredNodeIds && !filteredNodeIds.has(node.id);
              const isSelected = selectedNode?.id === node.id;
              const color = colorScale(node.group);
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  className="cursor-pointer"
                  opacity={dimmed ? 0.12 : 1}
                >
                  {/* Glow for selected */}
                  {isSelected && (
                    <circle r={r + 6} fill={color} fillOpacity={0.08} />
                  )}
                  <circle
                    r={r}
                    fill={color}
                    fillOpacity={isSelected ? 0.25 : 0.12}
                    stroke={color}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeOpacity={isSelected ? 0.9 : 0.4}
                  />
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    fill="currentColor"
                    fontSize={node.group === "architecture" ? 10 : 8}
                    fontWeight={node.group === "architecture" || isSelected ? 700 : 500}
                    opacity={dimmed ? 0.2 : 0.85}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Detail Panel — slides in from right */}
      {selectedNode && (
        <div className="w-80 shrink-0 overflow-y-auto border-l border-[var(--forge-border-subtle)] bg-background p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold">{selectedNode.label}</h3>
              <span
                className="mt-1 inline-block rounded-md px-2 py-0.5 text-[0.6rem] font-semibold"
                style={{
                  backgroundColor: `color-mix(in srgb, ${colorScale(selectedNode.group)} 15%, transparent)`,
                  color: colorScale(selectedNode.group),
                }}
              >
                {GROUP_LABELS[selectedNode.group]}
              </span>
            </div>
            <button onClick={() => setSelectedNode(null)} className="rounded-lg p-1 transition-colors hover:bg-muted">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{selectedNode.description}</p>

          {selectedNode.relatedStudy && (
            <Link href={`/study/${selectedNode.relatedStudy}`} className="mt-3 block text-xs text-primary hover:underline">
              관련 학습 자료 →
            </Link>
          )}

          <div className="mt-6">
            <h4 className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">연결된 노드</h4>
            <div className="space-y-1">
              {knowledgeGraphData.links
                .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                .slice(0, 10)
                .map((l, i) => {
                  const otherId = l.source === selectedNode.id ? l.target : l.source;
                  const otherNode = knowledgeGraphData.nodes.find((n) => n.id === otherId);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        const found = nodes.find((n) => n.id === otherId);
                        if (found) setSelectedNode(found);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[0.65rem] transition-colors hover:bg-primary/5"
                    >
                      <span className="shrink-0 text-primary">{l.label}</span>
                      <span className="text-muted-foreground">→ {otherNode?.label}</span>
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
