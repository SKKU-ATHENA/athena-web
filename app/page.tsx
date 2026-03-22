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

const bentoItems = [
  {
    href: "/demo",
    label: "라이브 데모",
    description: "같은 질문, 다른 답변. RAG vs GraphRAG를 직접 비교해보세요.",
    icon: Zap,
    size: "large" as const,
    accent: "from-amber-500/20 to-amber-600/5",
  },
  {
    href: "/explore",
    label: "KG 탐색기",
    description: "ATHENA의 지식 그래프를 인터랙티브하게 탐색하세요.",
    icon: Search,
    size: "large" as const,
    accent: "from-purple-500/20 to-purple-600/5",
  },
  {
    href: "/pre-assignment",
    label: "사전 과제",
    description: "RAG 파이프라인을 직접 만들고 한계를 발견하세요.",
    icon: FlaskConical,
    size: "small" as const,
    accent: "from-emerald-500/20 to-emerald-600/5",
  },
  {
    href: "/architecture",
    label: "아키텍처",
    description: "데이터가 지식으로 변환되는 과정.",
    icon: LayoutDashboard,
    size: "small" as const,
    accent: "from-blue-500/20 to-blue-600/5",
  },
  {
    href: "/study/environment-setup",
    label: "학습 자료",
    description: "6단계 학습 경로. 환경 세팅부터 GraphRAG까지.",
    icon: BookOpen,
    size: "small" as const,
    accent: "from-cyan-500/20 to-cyan-600/5",
  },
  {
    href: "/team",
    label: "팀 소개",
    description: "Co-Deep Learning 팀을 만나보세요.",
    icon: Users,
    size: "small" as const,
    accent: "from-rose-500/20 to-rose-600/5",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 pb-16">
      {/* ── Section 1: Hero ── */}
      <section className="relative overflow-hidden pt-8">
        {/* KG 프리뷰 배경 노드들 (장식용) */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {[
            { x: "10%", y: "20%", size: 6, delay: "0s", label: "RAG" },
            { x: "75%", y: "15%", size: 8, delay: "0.5s", label: "KG" },
            { x: "85%", y: "55%", size: 5, delay: "1s", label: "Neo4j" },
            { x: "20%", y: "70%", size: 7, delay: "1.5s", label: "LLM" },
            { x: "50%", y: "30%", size: 6, delay: "0.8s", label: "임베딩" },
            { x: "60%", y: "65%", size: 5, delay: "0.3s", label: "GraphRAG" },
            { x: "35%", y: "45%", size: 4, delay: "1.2s", label: "청킹" },
            { x: "90%", y: "35%", size: 4, delay: "0.7s", label: "벡터" },
          ].map((node, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[0.55rem] text-primary/40"
              style={{
                left: node.x,
                top: node.y,
                animation: `float ${3 + node.size * 0.5}s ease-in-out infinite`,
                animationDelay: node.delay,
              }}
            >
              {node.label}
            </div>
          ))}
          {/* SVG 연결선 */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.06]">
            <line x1="10%" y1="20%" x2="50%" y2="30%" stroke="currentColor" strokeWidth="1" />
            <line x1="50%" y1="30%" x2="75%" y2="15%" stroke="currentColor" strokeWidth="1" />
            <line x1="50%" y1="30%" x2="60%" y2="65%" stroke="currentColor" strokeWidth="1" />
            <line x1="20%" y1="70%" x2="35%" y2="45%" stroke="currentColor" strokeWidth="1" />
            <line x1="60%" y1="65%" x2="85%" y2="55%" stroke="currentColor" strokeWidth="1" />
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: "👥", value: "6명", label: "팀원" },
            { icon: "📝", value: "9개", label: "사전 과제" },
            { icon: "🕸️", value: "30+", label: "KG 노드" },
            { icon: "⚡", value: "RAG vs GraphRAG", label: "비교 데모" },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-4 text-center"
            >
              <div className="text-2xl">{stat.icon}</div>
              <div className="mt-1 text-lg font-bold tracking-tight">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Bento 퀵 네비게이션 ── */}
      <section>
        <h2
          className="animate-fade-up mb-6 text-xl font-bold tracking-tight"
          style={{ animationDelay: "0.12s" }}
        >
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
                  className={`h-full rounded-xl border border-border bg-gradient-to-br ${item.accent} p-5 transition-all duration-200 hover:-translate-y-[3px] hover:border-[var(--forge-border)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2),0_0_0_1px_var(--forge-border)] ${
                    isLarge ? "min-h-[140px]" : "min-h-[120px]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm">
                      <item.icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <h3 className={`font-bold tracking-tight ${isLarge ? "text-lg" : "text-sm"}`}>
                      {item.label}
                    </h3>
                  </div>
                  <p className={`mt-3 leading-relaxed text-muted-foreground ${isLarge ? "text-sm" : "text-xs"}`}>
                    {item.description}
                  </p>
                  <span className="mt-2 inline-block text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    탐색하기 →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Section 4: 아키텍처 프리뷰 ── */}
      <section
        className="animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        <h2 className="mb-6 text-xl font-bold tracking-tight">
          데이터 → 지식 파이프라인
        </h2>
        <Link href="/architecture" className="group block">
          <div className="overflow-x-auto rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-6 transition-all duration-200 hover:border-[var(--forge-border)]">
            <div className="flex items-center gap-2 min-w-[500px]">
              {pipelineSteps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5 rounded-lg border border-[var(--forge-border-subtle)] bg-background/50 px-4 py-3 text-center transition-colors duration-200 group-hover:border-[var(--forge-border)]">
                    <div
                      className="h-1 w-8 rounded-full"
                      style={{ backgroundColor: step.color }}
                    />
                    <span className="text-xs font-semibold">{step.label}</span>
                    <span className="max-w-[100px] text-[0.6rem] leading-tight text-muted-foreground">
                      {step.tech.join(", ")}
                    </span>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <span className="text-lg text-primary/50">→</span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              클릭하여 각 단계의 상세 설명 보기 →
            </p>
          </div>
        </Link>
      </section>

      {/* ── Section 5: 프로젝트 타임라인 ── */}
      <section
        className="animate-fade-up"
        style={{ animationDelay: "0.24s" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">프로젝트 타임라인</h2>
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
