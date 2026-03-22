"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { X, Search as SearchIcon, ZoomIn, ZoomOut } from "lucide-react";
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

export default function KGExplorer() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileListView />;
  }

  return <ForceGraphView />;
}

function MobileListView() {
  const [selectedNode, setSelectedNode] = useState<KGNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const groups = ["architecture", "technology", "concept", "decision"] as const;
  const groupLabels = { architecture: "아키텍처", technology: "기술", concept: "개념", decision: "의사결정" };

  const filteredNodes = knowledgeGraphData.nodes.filter(
    (n) => !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.includes(searchQuery)
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="노드 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-[var(--forge-border)] bg-[var(--forge-surface)] py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
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
                {groupLabels[group]} ({groupNodes.length})
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
                        <div className="mt-2">
                          <span className="text-[0.6rem] text-muted-foreground/70">연결:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {knowledgeGraphData.links
                              .filter((l) => l.source === node.id || l.target === node.id)
                              .map((l, i) => (
                                <span key={i} className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[0.55rem] text-primary">
                                  {l.label}: {l.source === node.id ? (typeof l.target === "string" ? l.target : "") : (typeof l.source === "string" ? l.source : "")}
                                </span>
                              ))}
                          </div>
                        </div>
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
  const simulationRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null);

  const colorScale = scaleOrdinal<string>()
    .domain(["architecture", "technology", "concept", "decision"])
    .range(GROUP_COLORS);

  // Initialize simulation
  useEffect(() => {
    const simNodes: SimNode[] = knowledgeGraphData.nodes.map((n) => ({ ...n }));
    const simLinks: SimLink[] = knowledgeGraphData.links.map((l) => ({
      source: l.source,
      target: l.target,
      type: l.type,
      label: l.label,
    }));

    const sim = forceSimulation(simNodes)
      .force("link", forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(80))
      .force("charge", forceManyBody().strength(-200))
      .force("center", forceCenter(400, 250))
      .force("collide", forceCollide(30))
      .on("tick", () => {
        setNodes([...simNodes]);
        setLinks([...simLinks]);
      });

    simulationRef.current = sim;

    return () => { sim.stop(); };
  }, []);

  // Setup zoom
  useEffect(() => {
    if (!svgRef.current) return;
    const svgEl = select(svgRef.current);
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        setTransform(event.transform);
      });
    svgEl.call(zoomBehavior);
    return () => { svgEl.on(".zoom", null); };
  }, []);

  const getNodeRadius = useCallback((node: SimNode) => {
    const connections = knowledgeGraphData.links.filter(
      (l) => l.source === node.id || l.target === node.id
    ).length;
    return Math.max(18, 12 + connections * 2);
  }, []);

  const filteredNodeIds = searchQuery
    ? new Set(
        knowledgeGraphData.nodes
          .filter((n) => n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.includes(searchQuery))
          .map((n) => n.id)
      )
    : null;

  const handleZoom = (direction: "in" | "out") => {
    const factor = direction === "in" ? 1.3 : 0.7;
    setTransform((prev) =>
      zoomIdentity.translate(prev.x, prev.y).scale(prev.k * factor)
    );
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="노드 검색... (예: Neo4j, GraphRAG)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[var(--forge-border)] bg-[var(--forge-surface)] py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={() => handleZoom("in")} className="rounded-lg border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-2.5 transition-colors hover:border-[var(--forge-border)]">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={() => handleZoom("out")} className="rounded-lg border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-2.5 transition-colors hover:border-[var(--forge-border)]">
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Graph */}
        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)]"
        >
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">그래프 초기화 중...</p>
            </div>
          )}

          <svg ref={svgRef} width="100%" height="500" className="cursor-grab active:cursor-grabbing">
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
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="currentColor"
                    strokeWidth={1}
                    opacity={dimmed ? 0.05 : 0.15}
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                if (node.x === undefined || node.y === undefined) return null;
                const r = getNodeRadius(node);
                const dimmed = filteredNodeIds && !filteredNodeIds.has(node.id);
                const isSelected = selectedNode?.id === node.id;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x},${node.y})`}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    className="cursor-pointer"
                    opacity={dimmed ? 0.15 : 1}
                  >
                    <circle
                      r={r}
                      fill={colorScale(node.group)}
                      fillOpacity={isSelected ? 0.3 : 0.15}
                      stroke={colorScale(node.group)}
                      strokeWidth={isSelected ? 2.5 : 1}
                      strokeOpacity={isSelected ? 1 : 0.5}
                    />
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fill="currentColor"
                      fontSize={node.group === "architecture" ? 9 : 7.5}
                      fontWeight={node.group === "architecture" ? 700 : 500}
                      opacity={dimmed ? 0.3 : 0.9}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex gap-3 rounded-lg bg-background/80 px-3 py-1.5 backdrop-blur-sm">
            {(["architecture", "technology", "concept", "decision"] as const).map((g, i) => (
              <div key={g} className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GROUP_COLORS[i] }} />
                <span className="text-[0.55rem] text-muted-foreground">
                  {{ architecture: "아키텍처", technology: "기술", concept: "개념", decision: "의사결정" }[g]}
                </span>
              </div>
            ))}
          </div>

          {/* Hint */}
          {!selectedNode && nodes.length > 0 && (
            <div className="absolute right-3 top-3 rounded-lg bg-background/80 px-3 py-1.5 text-[0.6rem] text-muted-foreground backdrop-blur-sm">
              노드를 클릭하여 탐색 · 드래그로 이동 · 스크롤로 줌
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedNode && (
          <div className="hidden w-72 shrink-0 space-y-3 rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-4 lg:block">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{selectedNode.label}</h3>
              <button onClick={() => setSelectedNode(null)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <span
              className="inline-block rounded-md px-2 py-0.5 text-[0.6rem] font-semibold"
              style={{
                backgroundColor: `color-mix(in srgb, ${colorScale(selectedNode.group)} 15%, transparent)`,
                color: colorScale(selectedNode.group),
              }}
            >
              {{ architecture: "아키텍처", technology: "기술", concept: "개념", decision: "의사결정" }[selectedNode.group]}
            </span>

            <p className="text-xs leading-relaxed text-muted-foreground">{selectedNode.description}</p>

            {selectedNode.relatedStudy && (
              <Link href={`/study/${selectedNode.relatedStudy}`} className="block text-xs text-primary hover:underline">
                관련 학습 자료 →
              </Link>
            )}

            <div>
              <h4 className="mb-1.5 text-[0.65rem] font-semibold text-muted-foreground">연결된 노드</h4>
              <div className="space-y-1">
                {knowledgeGraphData.links
                  .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                  .slice(0, 8)
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
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-[0.65rem] transition-colors hover:bg-primary/5"
                      >
                        <span className="text-primary">{l.label}</span>
                        <span className="text-muted-foreground">→ {otherNode?.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: selected node info */}
      {selectedNode && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 lg:hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">{selectedNode.label}</h3>
            <button onClick={() => setSelectedNode(null)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{selectedNode.description}</p>
          {selectedNode.relatedStudy && (
            <Link href={`/study/${selectedNode.relatedStudy}`} className="mt-1 block text-xs text-primary hover:underline">
              관련 학습 자료 →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
