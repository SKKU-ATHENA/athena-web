"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ChevronDown } from "lucide-react";
import { pipelineSteps, techStack, categoryLabels } from "@/lib/data/tech-stack";

export default function ArchitecturePage() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const categories = Object.entries(categoryLabels);

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-16">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
          <LayoutDashboard className="h-6 w-6 text-primary" />
        </div>
        <h1 className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-3xl font-extrabold tracking-[-0.03em] text-transparent">
          기술 아키텍처
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          ATHENA가 비정형 문서를 Knowledge Graph로 변환하고, 인과 사슬로 응답하는 과정입니다.
        </p>
      </div>

      {/* Section 1: 파이프라인 시각화 */}
      <section className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
        <h2 className="mb-6 text-xl font-bold tracking-tight">데이터 파이프라인</h2>

        {/* Desktop: 수평 */}
        <div className="hidden gap-3 md:flex">
          {pipelineSteps.map((step, i) => (
            <div key={step.id} className="flex flex-1 items-start gap-3">
              <button
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                className="group w-full rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-4 text-left transition-all duration-200 hover:border-[var(--forge-border)] hover:shadow-lg"
              >
                <div className="mb-2 h-1.5 w-10 rounded-full" style={{ backgroundColor: step.color }} />
                <h3 className="text-sm font-bold">{step.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                <ChevronDown className={`mt-2 h-3 w-3 text-muted-foreground transition-transform ${expandedStep === step.id ? "rotate-180" : ""}`} />

                {expandedStep === step.id && (
                  <div className="mt-3 border-t border-[var(--forge-border-subtle)] pt-3">
                    <p className="text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {step.tech.map((t) => (
                        <span key={t} className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-medium text-primary">
                          {t}
                        </span>
                      ))}
                    </div>
                    {step.relatedStudy && (
                      <Link href={`/study/${step.relatedStudy}`} className="mt-2 block text-[0.65rem] text-primary hover:underline">
                        관련 학습 자료 →
                      </Link>
                    )}
                  </div>
                )}
              </button>
              {i < pipelineSteps.length - 1 && (
                <span className="mt-8 shrink-0 text-lg text-primary/40">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: 수직 */}
        <div className="space-y-3 md:hidden">
          {pipelineSteps.map((step, i) => (
            <div key={step.id}>
              <button
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                className="w-full rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-4 text-left transition-all hover:border-[var(--forge-border)]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: step.color }} />
                  <div>
                    <h3 className="text-sm font-bold">{step.label}</h3>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expandedStep === step.id ? "rotate-180" : ""}`} />
                </div>

                {expandedStep === step.id && (
                  <div className="mt-3 border-t border-[var(--forge-border-subtle)] pt-3 pl-5">
                    <p className="text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {step.tech.map((t) => (
                        <span key={t} className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-medium text-primary">
                          {t}
                        </span>
                      ))}
                    </div>
                    {step.relatedStudy && (
                      <Link href={`/study/${step.relatedStudy}`} className="mt-2 block text-[0.65rem] text-primary hover:underline">
                        관련 학습 자료 →
                      </Link>
                    )}
                  </div>
                )}
              </button>
              {i < pipelineSteps.length - 1 && (
                <div className="flex justify-center py-1">
                  <span className="text-sm text-primary/40">↓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: 기술 스택 */}
      <section className="animate-fade-up" style={{ animationDelay: "0.12s" }}>
        <h2 className="mb-6 text-xl font-bold tracking-tight">기술 스택</h2>
        <div className="space-y-6">
          {categories.map(([catKey, catLabel]) => {
            const items = techStack.filter((t) => t.category === catKey);
            if (items.length === 0) return null;
            return (
              <div key={catKey}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {catLabel}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((tech) => (
                    <div
                      key={tech.name}
                      className="group rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-3.5 transition-all duration-200 hover:border-[var(--forge-border)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tech.icon}</span>
                        <span className="text-sm font-semibold">{tech.name}</span>
                        {tech.version && (
                          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-mono text-primary">
                            v{tech.version}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {tech.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: RAG vs GraphRAG 아키텍처 비교 */}
      <section className="animate-fade-up" style={{ animationDelay: "0.16s" }}>
        <h2 className="mb-6 text-xl font-bold tracking-tight">RAG vs GraphRAG 아키텍처</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* RAG */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
            <h3 className="mb-3 text-sm font-bold text-blue-400">기본 RAG</h3>
            <div className="space-y-2">
              {["질문 입력", "벡터 유사도 검색 (Top-K)", "관련 청크 수집", "LLM에 컨텍스트 주입", "답변 생성"].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[0.6rem] font-bold text-blue-400">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-blue-400/70">한계: 청크 간 관계 정보 손실, 인과 추론 불가</p>
          </div>

          {/* GraphRAG */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h3 className="mb-3 text-sm font-bold text-amber-400">GraphRAG</h3>
            <div className="space-y-2">
              {["질문 분석 + 엔티티 식별", "Knowledge Graph 다단계 탐색", "커뮤니티 요약 수집", "인과 사슬 합성", "구조화된 답변 생성"].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[0.6rem] font-bold text-amber-400">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-amber-400/70">강점: 관계 보존, 다단계 추론, 인과 사슬 추적</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/demo" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            직접 비교해보기 →
          </Link>
        </div>
      </section>

      {/* Note */}
      <div className="rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-4 text-center text-xs text-muted-foreground">
        이 페이지는 ATHENA 시스템의 실제 아키텍처를 설명합니다. 이 웹사이트 자체는 정적 사이트(GitHub Pages)로 배포됩니다.
      </div>
    </div>
  );
}
