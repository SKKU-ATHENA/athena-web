import Link from "next/link";
import {
  ArrowRight,
  FlaskConical,
  Zap,
  Search,
  LayoutDashboard,
  BookOpen,
  Users,
} from "lucide-react";
import { MilestoneTracker } from "@/components/milestone-tracker";
import { pipelineSteps } from "@/lib/data/tech-stack";

// Hero 노드 — 카테고리별 네온 색상
const heroNodes = [
  { x: "8%", y: "18%", delay: "0s", label: "RAG", color: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  { x: "78%", y: "12%", delay: "0.5s", label: "KG", color: "#a855f7", glow: "rgba(168,85,247,0.3)" },
  { x: "88%", y: "52%", delay: "1s", label: "Neo4j", color: "#06b6d4", glow: "rgba(6,182,212,0.3)" },
  { x: "18%", y: "72%", delay: "1.5s", label: "LLM", color: "#06b6d4", glow: "rgba(6,182,212,0.3)" },
  { x: "52%", y: "28%", delay: "0.8s", label: "ATHENA", color: "#f59e0b", glow: "rgba(245,158,11,0.5)" },
  { x: "62%", y: "68%", delay: "0.3s", label: "GraphRAG", color: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  { x: "33%", y: "48%", delay: "1.2s", label: "청킹", color: "#a855f7", glow: "rgba(168,85,247,0.25)" },
  { x: "92%", y: "32%", delay: "0.7s", label: "벡터", color: "#a855f7", glow: "rgba(168,85,247,0.25)" },
  { x: "42%", y: "82%", delay: "0.9s", label: "왜?", color: "#ef4444", glow: "rgba(239,68,68,0.3)" },
];

const bentoItems = [
  {
    href: "/demo",
    label: "라이브 데모",
    description: "같은 질문, 다른 답변. RAG vs GraphRAG를 직접 비교.",
    icon: Zap,
    size: "large" as const,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.15)",
  },
  {
    href: "/explore",
    label: "KG 탐색기",
    description: "ATHENA의 지식 그래프를 인터랙티브하게 탐색.",
    icon: Search,
    size: "large" as const,
    color: "#a855f7",
    glow: "rgba(168,85,247,0.15)",
  },
  {
    href: "/pre-assignment",
    label: "사전 과제",
    description: "RAG 파이프라인을 직접 만들고 한계를 발견.",
    icon: FlaskConical,
    size: "small" as const,
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.12)",
  },
  {
    href: "/architecture",
    label: "아키텍처",
    description: "데이터가 지식으로 변환되는 과정.",
    icon: LayoutDashboard,
    size: "small" as const,
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.12)",
  },
  {
    href: "/study/environment-setup",
    label: "학습 자료",
    description: "6단계 학습 경로. 환경 세팅부터 GraphRAG까지.",
    icon: BookOpen,
    size: "small" as const,
    color: "#a855f7",
    glow: "rgba(168,85,247,0.12)",
  },
  {
    href: "/team",
    label: "팀 소개",
    description: "Co-Deep Learning 팀을 만나보세요.",
    icon: Users,
    size: "small" as const,
    color: "#ef4444",
    glow: "rgba(239,68,68,0.12)",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 pb-16">
      {/* ── Section 1: Hero (네온 와이어프레임) ── */}
      <section className="relative overflow-hidden pt-8">
        {/* 네온 노드 배경 */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {heroNodes.map((node, i) => (
            <div
              key={i}
              className="absolute rounded-full border px-2 py-0.5 font-mono text-[0.6rem]"
              style={{
                left: node.x,
                top: node.y,
                borderColor: `${node.color}40`,
                color: `${node.color}80`,
                background: `${node.color}06`,
                boxShadow: `0 0 12px ${node.glow}`,
                animation: `float ${3.5 + i * 0.3}s ease-in-out infinite`,
                animationDelay: node.delay,
              }}
            >
              {node.label}
            </div>
          ))}
          {/* 네온 커넥터 라인 */}
          <svg className="absolute inset-0 h-full w-full">
            {[
              ["8%", "18%", "52%", "28%"],
              ["52%", "28%", "78%", "12%"],
              ["52%", "28%", "62%", "68%"],
              ["18%", "72%", "33%", "48%"],
              ["62%", "68%", "88%", "52%"],
              ["33%", "48%", "52%", "28%"],
              ["42%", "82%", "62%", "68%"],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="0.5" opacity="0.08" />
            ))}
          </svg>
        </div>

        <div className="relative z-10 animate-fade-up text-center">
          <h1 className="bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-[clamp(2.2rem,5vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-0.04em] text-transparent">
            의사결정의 &lsquo;왜?&rsquo;에
            <br />
            답할 수 있다면?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            ATHENA는 의사결정 근거를 Knowledge Graph로 구조화하여
            인과 사슬로 응답하는 AI 지식 관리 시스템입니다.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/pre-assignment"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_20px_rgba(245,158,11,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(245,158,11,0.35)]"
            >
              사전 과제 시작 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 px-6 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/5"
            >
              데모 체험
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 2: 프로젝트 하이라이트 ── */}
      <section className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: "👥", value: "6명", label: "팀원", color: "#f59e0b" },
            { icon: "📝", value: "9개", label: "사전 과제", color: "#06b6d4" },
            { icon: "🕸️", value: "30+", label: "KG 노드", color: "#a855f7" },
            { icon: "⚡", value: "5종", label: "질문 비교", color: "#ef4444" },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border p-4 text-center transition-all duration-200 hover:border-opacity-50"
              style={{
                borderColor: `${stat.color}20`,
                background: `${stat.color}04`,
              }}
            >
              <div className="text-2xl">{stat.icon}</div>
              <div className="mt-1 text-lg font-bold tracking-tight">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Bento 네비게이션 (네온 테마) ── */}
      <section>
        <h2 className="animate-fade-up mb-6 flex items-center gap-3 text-xl font-bold tracking-tight" style={{ animationDelay: "0.12s" }}>
          <span className="h-1 w-8 rounded-full bg-primary" />
          탐색하기
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {bentoItems.map((item, i) => {
            const isLarge = item.size === "large";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`animate-fade-up group ${isLarge ? "sm:col-span-2" : ""}`}
                style={{ animationDelay: `${0.14 + i * 0.04}s` }}
              >
                <div
                  className={`h-full rounded-xl border border-[var(--forge-border-subtle)] p-5 transition-all duration-200 hover:-translate-y-[3px] hover:border-[var(--forge-border)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] ${isLarge ? "min-h-[140px]" : "min-h-[120px]"}`}
                  style={{
                    background: `linear-gradient(135deg, ${item.color}06, transparent)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${item.color}12`, border: `1px solid ${item.color}20` }}
                    >
                      <item.icon className="h-4 w-4" style={{ color: item.color }} />
                    </div>
                    <h3 className={`font-bold tracking-tight ${isLarge ? "text-lg" : "text-sm"}`}>
                      {item.label}
                    </h3>
                  </div>
                  <p className={`mt-3 leading-relaxed text-muted-foreground ${isLarge ? "text-sm" : "text-xs"}`}>
                    {item.description}
                  </p>
                  <span className="mt-2 inline-block text-xs font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ color: item.color }}>
                    탐색하기 →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Section 4: 파이프라인 프리뷰 ── */}
      <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="mb-6 flex items-center gap-3 text-xl font-bold tracking-tight">
          <span className="h-1 w-8 rounded-full bg-primary" />
          데이터 → 지식 파이프라인
        </h2>
        <Link href="/architecture" className="group block">
          <div className="overflow-x-auto rounded-xl border border-white/5 p-6 transition-all duration-200 hover:border-white/10" style={{ background: "#08080a" }}>
            <div className="flex items-center gap-3 min-w-[520px]">
              {pipelineSteps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3 text-center transition-all duration-200 group-hover:border-white/12">
                    <div className="h-1 w-8 rounded-full" style={{ backgroundColor: step.color, opacity: 0.7 }} />
                    <span className="text-xs font-semibold text-white/80">{step.label}</span>
                    <span className="max-w-[100px] text-[0.55rem] leading-tight text-white/35">
                      {step.tech.join(", ")}
                    </span>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <svg width="20" height="10" viewBox="0 0 20 10" className="shrink-0">
                      <path d="M0 5 L14 5 M10 1.5 L14 5 L10 8.5" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.3" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-[0.65rem] text-white/25">
              클릭하여 상세 아키텍처 보기 →
            </p>
          </div>
        </Link>
      </section>

      {/* ── Section 5: 타임라인 ── */}
      <section className="animate-fade-up" style={{ animationDelay: "0.24s" }}>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <span className="h-1 w-8 rounded-full bg-primary" />
            프로젝트 타임라인
          </h2>
          <Link href="/team" className="text-xs text-primary hover:underline">
            상세 보기 →
          </Link>
        </div>
        <div className="mt-4 rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-6">
          <MilestoneTracker />
        </div>
      </section>
    </div>
  );
}
