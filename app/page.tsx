import Link from "next/link";
import { ArrowRight, FlaskConical, Layers, Database, FileText, Brain, Network, Settings } from "lucide-react";
import { MilestoneTracker } from "@/components/milestone-tracker";
import { studyMaterials } from "@/lib/curriculum";

const iconMap: Record<string, React.ElementType> = {
  layers: Layers,
  database: Database,
  "file-text": FileText,
  brain: Brain,
  network: Network,
  settings: Settings,
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {/* ── Hero ── */}
      <div className="animate-fade-up">
        <h1 className="bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-[-0.035em] text-transparent">
          ATHENA 학습 허브
        </h1>
        <p className="mt-2 text-muted-foreground">
          AI 기반 지식 관리 시스템 — 학습 자료 정리
        </p>
      </div>

      {/* ── Milestone ── */}
      <div
        className="animate-fade-up rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-6"
        style={{ animationDelay: "0.04s" }}
      >
        <MilestoneTracker />
      </div>

      {/* ── Pre-assignment CTA ── */}
      <div
        className="animate-fade-up group rounded-xl border border-[var(--forge-border)] bg-[var(--forge-glow)] p-6 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(34,184,207,0.12)]"
        style={{ animationDelay: "0.08s" }}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform duration-300 group-hover:scale-105">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold tracking-tight">
              사전 과제: &ldquo;내 손으로 만드는 RAG&rdquo;
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              RAG 파이프라인을 직접 조립하고, 한계를 발견한 뒤, Microsoft
              GraphRAG와 비교합니다. Ollama 로컬 모델로 비용 0.
            </p>
            <Link
              href="/pre-assignment"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22b8cf] to-[#67e8f9] px-5 py-2.5 text-sm font-semibold text-[#0a0c0d] shadow-[0_4px_20px_rgba(34,184,207,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(34,184,207,0.45),inset_0_1px_0_rgba(255,255,255,0.15)]"
            >
              시작하기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Study Materials ── */}
      <div>
        <h2
          className="animate-fade-up mb-5 text-xl font-bold tracking-tight"
          style={{ animationDelay: "0.12s" }}
        >
          학습 자료
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {studyMaterials.map((material, i) => {
            const Icon = iconMap[material.icon] || FileText;
            return (
              <Link
                key={material.slug}
                href={`/study/${material.slug}`}
                className="animate-fade-up group"
                style={{ animationDelay: `${0.16 + i * 0.04}s` }}
              >
                <div className="h-full rounded-xl border border-border bg-[var(--forge-surface)] p-5 transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[3px] hover:border-[var(--forge-border)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2),0_0_0_1px_var(--forge-border)]">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold tracking-tight">
                      {material.title}
                    </h3>
                  </div>
                  <p className="mt-2.5 text-[0.8rem] leading-relaxed text-muted-foreground">
                    {material.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
