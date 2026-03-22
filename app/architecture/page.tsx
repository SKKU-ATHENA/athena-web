"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ChevronDown, ExternalLink } from "lucide-react";
import { pipelineSteps, techStack, categoryLabels } from "@/lib/data/tech-stack";

const STEP_COLORS = ["#d97706", "#fbbf24", "#f59e0b", "#b45309"];
const STEP_GLOWS = ["rgba(217,119,6,0.35)", "rgba(251,191,36,0.35)", "rgba(245,158,11,0.35)", "rgba(180,83,9,0.35)"];

export default function ArchitecturePage() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

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

      {/* Section 1: 파이프라인 시각화 — Neon Wireframe */}
      <section className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
        <h2 className="mb-6 text-xl font-bold tracking-tight">데이터 파이프라인</h2>

        {/* Desktop: 시각적 파이프라인 */}
        <div className="hidden md:block">
            {/* SVG 커넥터 라인 */}
            <div className="relative">
              {/* 수평 연결 라인 (배경) */}
              <div className="absolute left-0 right-0 top-[52px] z-0 mx-20">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              </div>

              {/* 스텝 카드 */}
              <div className="relative z-10 grid grid-cols-4 gap-4">
                {pipelineSteps.map((step, i) => {
                  const isActive = expandedStep === step.id;
                  const isHovered = hoveredStep === step.id;
                  const color = STEP_COLORS[i];
                  const glow = STEP_GLOWS[i];

                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      {/* 단계 번호 */}
                      <div
                        className="mb-3 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold"
                        style={{
                          borderColor: isActive || isHovered ? color : `${color}40`,
                          color: color,
                          boxShadow: isActive || isHovered ? `0 0 12px ${glow}` : "none",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {i + 1}
                      </div>

                      {/* 카드 */}
                      <button
                        onClick={() => setExpandedStep(isActive ? null : step.id)}
                        onMouseEnter={() => setHoveredStep(step.id)}
                        onMouseLeave={() => setHoveredStep(null)}
                        className="w-full text-left transition-all duration-300"
                      >
                        <div
                          className="rounded-xl border p-4"
                          style={{
                            borderColor: isActive || isHovered ? `${color}60` : "rgba(255,255,255,0.06)",
                            background: isActive ? `${color}08` : "#0f0f12",
                            boxShadow: isActive || isHovered ? `0 0 20px ${glow}, inset 0 1px 0 ${color}15` : "none",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {/* 컬러 바 */}
                          <div className="mb-3 h-1 w-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)`, opacity: isActive || isHovered ? 1 : 0.4 }} />

                          <h3 className="text-sm font-bold" style={{ color: isActive || isHovered ? color : "white" }}>
                            {step.label}
                          </h3>
                          <p className="mt-1.5 text-[0.7rem] leading-relaxed text-muted-foreground">
                            {step.description}
                          </p>

                          {/* 기술 태그 — 항상 표시 */}
                          <div className="mt-3 flex flex-wrap gap-1">
                            {step.tech.map((t) => (
                              <span
                                key={t}
                                className="rounded-md px-1.5 py-0.5 text-[0.55rem] font-medium"
                                style={{
                                  backgroundColor: `${color}15`,
                                  color: `${color}cc`,
                                  border: `1px solid ${color}20`,
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>

                          {/* 확장 영역 */}
                          {isActive && (
                            <div className="mt-3 border-t pt-3" style={{ borderColor: `${color}20` }}>
                              <p className="text-[0.7rem] leading-relaxed text-muted-foreground">{step.detail}</p>
                              {step.relatedStudy && (
                                <Link
                                  href={`/study/${step.relatedStudy}`}
                                  className="mt-2 inline-flex items-center gap-1 text-[0.65rem] font-medium hover:underline"
                                  style={{ color }}
                                >
                                  학습 자료 <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </button>

                      {/* 화살표 (마지막 제외) */}
                      {i < pipelineSteps.length - 1 && (
                        <div className="absolute top-[52px]" style={{ left: `${(i + 1) * 25 - 2}%` }}>
                          <svg width="24" height="12" viewBox="0 0 24 12" className="text-amber-500/30">
                            <path d="M0 6 L18 6 M14 2 L18 6 L14 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 데이터 흐름 라벨 */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[0.6rem] text-muted-foreground/50">
                <span>비정형 문서</span>
                <span>→</span>
                <span>벡터 + 그래프</span>
                <span>→</span>
                <span>구조화된 지식</span>
                <span>→</span>
                <span>인과 사슬 응답</span>
              </div>
            </div>
        </div>

        {/* Mobile: 수직 네온 파이프라인 */}
        <div className="md:hidden">
            <div className="relative border-l-2 border-amber-500/15 pl-6">
              {pipelineSteps.map((step, i) => {
                const isActive = expandedStep === step.id;
                const color = STEP_COLORS[i];
                const glow = STEP_GLOWS[i];

                return (
                  <div key={step.id} className="relative pb-8 last:pb-0">
                    {/* 타임라인 점 */}
                    <div
                      className="absolute -left-[1.56rem] flex h-5 w-5 items-center justify-center rounded-full border text-[0.5rem] font-bold"
                      style={{
                        borderColor: color,
                        color,
                        background: "var(--background)",
                        boxShadow: isActive ? `0 0 10px ${glow}` : "none",
                      }}
                    >
                      {i + 1}
                    </div>

                    <button
                      onClick={() => setExpandedStep(isActive ? null : step.id)}
                      className="w-full text-left"
                    >
                      <div
                        className="rounded-xl border p-4 transition-all duration-300"
                        style={{
                          borderColor: isActive ? `${color}50` : "rgba(255,255,255,0.06)",
                          background: isActive ? `${color}08` : "#0f0f12",
                          boxShadow: isActive ? `0 0 16px ${glow}` : "none",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold" style={{ color: isActive ? color : "white" }}>{step.label}</h3>
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} style={{ color: `${color}80` }} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {step.tech.map((t) => (
                            <span key={t} className="rounded-md px-1.5 py-0.5 text-[0.55rem] font-medium"
                              style={{ backgroundColor: `${color}15`, color: `${color}cc` }}>
                              {t}
                            </span>
                          ))}
                        </div>

                        {isActive && (
                          <div className="mt-3 border-t pt-3" style={{ borderColor: `${color}20` }}>
                            <p className="text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
                            {step.relatedStudy && (
                              <Link href={`/study/${step.relatedStudy}`} className="mt-2 inline-flex items-center gap-1 text-[0.65rem] font-medium hover:underline" style={{ color }}>
                                학습 자료 <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
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
                    <div key={tech.name}
                      className="group rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-3.5 transition-all duration-200 hover:border-[var(--forge-border)]">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tech.icon}</span>
                        <span className="text-sm font-semibold">{tech.name}</span>
                        {tech.version && (
                          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-mono text-primary">
                            v{tech.version}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{tech.reason}</p>
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
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
            <h3 className="mb-3 text-sm font-bold text-blue-400">기본 RAG</h3>
            <div className="space-y-2">
              {["질문 입력", "벡터 유사도 검색 (Top-K)", "관련 청크 수집", "LLM에 컨텍스트 주입", "답변 생성"].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[0.6rem] font-bold text-blue-400">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-blue-400/70">한계: 청크 간 관계 정보 손실, 인과 추론 불가</p>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h3 className="mb-3 text-sm font-bold text-amber-400">GraphRAG</h3>
            <div className="space-y-2">
              {["질문 분석 + 엔티티 식별", "Knowledge Graph 다단계 탐색", "커뮤니티 요약 수집", "인과 사슬 합성", "구조화된 답변 생성"].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[0.6rem] font-bold text-amber-400">{i + 1}</span>
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
