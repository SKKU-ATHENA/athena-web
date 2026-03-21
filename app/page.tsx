import Link from "next/link";
import { ArrowRight, FlaskConical, Clock } from "lucide-react";
import { MilestoneTracker } from "@/components/milestone-tracker";
import { studyMaterials } from "@/lib/curriculum";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {/* ── Hero ── */}
      <div className="animate-fade-up">
        <h1 className="bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-[-0.035em] text-transparent">
          ATHENA 학습 허브
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Co-Deep Learning 팀을 위한 RAG &amp; GraphRAG 학습 허브. 환경 세팅부터 사전 과제까지 단계별로 안내합니다.
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
        className="animate-fade-up group rounded-xl border border-primary/30 bg-[var(--forge-glow)] p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_12px_40px_rgba(34,184,207,0.15)]"
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
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> 4~6시간</span>
              <span>산출물 4개</span>
            </div>
            <Link
              href="/pre-assignment"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/60 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_20px_var(--forge-glow)] transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_var(--forge-glow)]"
            >
              시작하기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Study Materials ── */}
      <div>
        <div className="mb-6 h-px bg-[var(--forge-border-subtle)]" />
        <h2
          className="animate-fade-up mb-1 text-xl font-bold tracking-tight"
          style={{ animationDelay: "0.12s" }}
        >
          학습 자료
        </h2>
        <p
          className="animate-fade-up mb-5 text-sm text-muted-foreground"
          style={{ animationDelay: "0.12s" }}
        >
          번호 순서대로 읽는 것을 권장합니다. 환경 세팅 → 핵심 개념 → 사전 과제 순으로 진행하세요.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {studyMaterials.map((material, i) => {
            return (
              <Link
                key={material.slug}
                href={`/study/${material.slug}`}
                className="animate-fade-up group rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                style={{ animationDelay: `${0.16 + i * 0.04}s` }}
              >
                <div className="h-full rounded-xl border border-border bg-[var(--forge-surface)] p-5 transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[3px] hover:border-[var(--forge-border)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2),0_0_0_1px_var(--forge-border)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/15 font-mono text-xs font-bold text-primary">
                      {material.order}
                    </span>
                    <h3 className="text-sm font-semibold tracking-tight">
                      {material.title}
                    </h3>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {material.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[0.65rem] font-medium ${
                        material.difficulty === "입문" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        material.difficulty === "심화" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                        "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}>
                        {material.difficulty}
                      </span>
                      <span className="text-[0.7rem] text-muted-foreground">
                        {material.readingTime}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
