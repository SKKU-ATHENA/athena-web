"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Zap, SkipForward, Lightbulb, Check, ChevronRight } from "lucide-react";
import { demoQuestions, categoryDescriptions, type DemoQuestion } from "@/lib/data/demo-comparisons";

// ── 난이도 색상 스케일 (green → red) ──
const difficultyColors: Record<string, string> = {
  fact: "#22c55e",
  simple: "#4ade80",
  comparison: "#f59e0b",
  causal: "#ef4444",
  summary: "#dc2626",
};

const categoryOrder = ["fact", "simple", "comparison", "causal", "summary"] as const;

// ── ThinkingDots — 답변 전 "생각 중" 애니메이션 ──
function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
          style={{
            animation: "thinking-dot 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </span>
  );
}

// ── TypingText (thinking phase 포함) ──
function TypingText({
  text,
  onComplete,
  skip,
}: {
  text: string;
  onComplete: () => void;
  skip: boolean;
}) {
  const [phase, setPhase] = useState<"thinking" | "typing" | "done">("thinking");
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (skip) {
      setPhase("done");
      setDisplayed(text);
      onCompleteRef.current();
      return;
    }

    setPhase("thinking");
    setDisplayed("");
    indexRef.current = 0;

    timerRef.current = setTimeout(() => {
      setPhase("typing");
      const duration = text.length < 100 ? 1000 : 2000;
      const charsPerTick = Math.max(1, Math.ceil(text.length / (duration / 30)));
      intervalRef.current = setInterval(() => {
        indexRef.current += charsPerTick;
        if (indexRef.current >= text.length) {
          setDisplayed(text);
          setPhase("done");
          if (intervalRef.current) clearInterval(intervalRef.current);
          onCompleteRef.current();
        } else {
          setDisplayed(text.slice(0, indexRef.current));
        }
      }, 50);
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, skip]);

  if (phase === "thinking") return <ThinkingDots />;
  return <span style={{ whiteSpace: "pre-wrap" }}>{displayed}</span>;
}

// ── VerdictBadge ──
function VerdictBadge({ verdict, label }: { verdict: string; label: string }) {
  const colors: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    partial: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    fail: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`inline-block animate-fade-up rounded-lg border px-2.5 py-1 text-xs font-medium ${colors[verdict] || colors.fail}`}>
      {label}
    </span>
  );
}

// ── EmptyState — 난이도 프로그레션 시각화 ──
function EmptyState({ onSelectFirst }: { onSelectFirst: () => void }) {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h3 className="text-sm font-bold tracking-tight">
            질문이 복잡해질수록, 차이가 드러납니다
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            동일한 질문을 RAG와 GraphRAG에 던져보고
            어디서 성능 차이가 발생하는지 확인하세요
          </p>
        </div>

        {/* 난이도 그래디언트 시각화 */}
        <div className="space-y-3 rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-4">
          <div className="flex items-center justify-between text-[0.6rem] text-muted-foreground/60">
            <span>RAG 충분</span>
            <span>RAG 한계</span>
          </div>
          <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500/60 via-amber-500/60 to-red-500/60" />
          <div className="flex justify-between">
            {categoryOrder.map((catKey) => {
              const color = difficultyColors[catKey];
              const cat = categoryDescriptions[catKey];
              return (
                <div key={catKey} className="flex flex-col items-center gap-1.5">
                  <div
                    className="h-3 w-3 rounded-full border-2 border-[var(--forge-surface)]"
                    style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}30` }}
                  />
                  <span className="text-[0.55rem] font-semibold" style={{ color }}>
                    {cat.label}
                  </span>
                  <span className="text-[0.5rem] text-muted-foreground/50">
                    {cat.ragCapability.replace("RAG ", "").replace(/^[^\s]+ /, "")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 비교 프리뷰 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
            <div className="text-sm font-bold text-blue-400">기본 RAG</div>
            <p className="mt-2 text-[0.65rem] leading-relaxed text-blue-400/50">
              빠르고 간결하지만<br />인과 추론에 약함
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
            <div className="text-sm font-bold text-amber-400">GraphRAG</div>
            <p className="mt-2 text-[0.65rem] leading-relaxed text-amber-400/50">
              다단계 추론으로<br />&lsquo;왜?&rsquo;에 답할 수 있음
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onSelectFirst}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 px-5 py-2.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]"
          >
            첫 번째 질문부터 시작
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <p className="mt-3 text-[0.6rem] text-muted-foreground/40">
            또는 왼쪽에서 원하는 질문을 직접 선택하세요
          </p>
        </div>
      </div>
    </div>
  );
}

// ── NextQuestionSuggestion ──
function NextQuestionSuggestion({
  currentId,
  viewedIds,
  onSelect,
}: {
  currentId: string;
  viewedIds: Set<string>;
  onSelect: (id: string) => void;
}) {
  const currentIndex = demoQuestions.findIndex((q) => q.id === currentId);
  const nextUnviewed = demoQuestions.find((q, i) => i > currentIndex && !viewedIds.has(q.id));

  if (!nextUnviewed) return null;

  const color = difficultyColors[nextUnviewed.category];

  return (
    <button
      onClick={() => onSelect(nextUnviewed.id)}
      className="group w-full rounded-xl border border-[var(--forge-border-subtle)] p-4 text-left transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.02]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[0.65rem] text-muted-foreground">다음 질문</span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <p className="mt-1.5 text-xs font-medium text-foreground/80">{nextUnviewed.question}</p>
    </button>
  );
}

// ── CompletionCard — 모든 질문 완료 시 표시 ──
function CompletionCard() {
  return (
    <div className="animate-fade-up rounded-xl border border-primary/25 bg-primary/[0.03] p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
          <Zap className="h-3.5 w-3.5 text-primary" />
        </div>
        <h4 className="text-sm font-bold">모든 비교를 확인했습니다</h4>
      </div>
      <div className="space-y-1.5">
        {categoryOrder.map((catKey) => {
          const cat = categoryDescriptions[catKey];
          const color = difficultyColors[catKey];
          const questions = demoQuestions.filter((q) => q.category === catKey);
          const hasFailure = questions.some((q) => q.ragResponse.verdict === "fail");
          const hasPartial = questions.some((q) => q.ragResponse.verdict === "partial");
          const ragStatus = hasFailure ? "\u274C" : hasPartial ? "\u26A0\uFE0F" : "\u2705";
          return (
            <div key={catKey} className="flex items-center gap-2 rounded-lg px-2 py-1">
              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="flex-1 text-[0.65rem]">{cat.label}</span>
              <span className="text-[0.6rem] font-mono">RAG {ragStatus}</span>
              <span className="text-[0.6rem] font-mono text-emerald-400">GraphRAG {"\u2705"}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 rounded-lg bg-[var(--forge-surface-raised)] p-3">
        <p className="text-xs leading-relaxed text-foreground/80">
          <span className="font-semibold text-primary">결론: </span>
          단순 검색에는 RAG로 충분하지만, 비교/인과/요약처럼{" "}
          <span className="font-medium">관계를 이해해야 하는 질문</span>에서는
          Knowledge Graph가 필수적입니다.
        </p>
      </div>
    </div>
  );
}

// ── MobileTabView ──
function MobileTabView({ question }: { question: DemoQuestion }) {
  const [activeTab, setActiveTab] = useState<"rag" | "graphrag">("rag");

  const ragVerdict = question.ragResponse.verdict;
  const ragPanelBorder =
    ragVerdict === "fail"
      ? "border-red-500/15 bg-red-500/[0.02]"
      : ragVerdict === "partial"
      ? "border-amber-500/20 bg-amber-500/[0.04]"
      : "border-blue-500/20 bg-blue-500/5";

  return (
    <div className="md:hidden">
      <div className="mb-3 flex rounded-lg border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)]">
        <button
          onClick={() => setActiveTab("rag")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
            activeTab === "rag" ? "bg-blue-500/10 text-blue-400" : "text-muted-foreground"
          }`}
        >
          기본 RAG
        </button>
        <button
          onClick={() => setActiveTab("graphrag")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
            activeTab === "graphrag" ? "bg-amber-500/10 text-amber-400" : "text-muted-foreground"
          }`}
        >
          GraphRAG
        </button>
      </div>

      {activeTab === "rag" ? (
        <div className={`rounded-xl border p-4 transition-colors ${ragPanelBorder}`}>
          <div className="mb-2 flex items-center gap-2">
            <h3 className={`text-sm font-bold ${ragVerdict === "fail" ? "text-red-400/70" : "text-blue-400"}`}>
              기본 RAG
            </h3>
            <VerdictBadge verdict={question.ragResponse.verdict} label={question.ragResponse.verdictLabel} />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{question.ragResponse.text}</p>
          <p className={`mt-2 text-xs ${ragVerdict === "fail" ? "text-red-400/40" : "text-blue-400/70"}`}>
            {question.ragResponse.verdictDetail}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-bold text-amber-400">GraphRAG</h3>
            <VerdictBadge verdict={question.graphragResponse.verdict} label={question.graphragResponse.verdictLabel} />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{question.graphragResponse.text}</p>
          <p className="mt-2 text-xs text-amber-400/70">{question.graphragResponse.verdictDetail}</p>
        </div>
      )}
    </div>
  );
}

// ── Main DemoPage ──
export default function DemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [skipTyping, setSkipTyping] = useState(false);
  const [ragDone, setRagDone] = useState(false);
  const [graphragDone, setGraphragDone] = useState(false);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  const selectedQuestion = demoQuestions.find((q) => q.id === selectedId);
  const allViewed = viewedIds.size === demoQuestions.length;

  // 양쪽 응답이 완료되면 viewed 처리
  useEffect(() => {
    if (ragDone && graphragDone && selectedId) {
      setViewedIds((prev) => {
        const next = new Set(prev);
        next.add(selectedId);
        return next;
      });
    }
  }, [ragDone, graphragDone, selectedId]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setSkipTyping(false);
    setRagDone(false);
    setGraphragDone(false);
  }, []);

  // verdict 기반 패널 스타일
  const ragDimmed = ragDone && selectedQuestion?.ragResponse.verdict === "fail";

  const ragPanelClass = !ragDone
    ? "border-blue-500/20 bg-blue-500/5"
    : selectedQuestion?.ragResponse.verdict === "fail"
    ? "border-red-500/15 bg-red-500/[0.02]"
    : selectedQuestion?.ragResponse.verdict === "partial"
    ? "border-amber-500/20 bg-amber-500/[0.04]"
    : "border-blue-500/25 bg-blue-500/[0.06]";

  const graphragPanelClass = !graphragDone
    ? "border-amber-500/20 bg-amber-500/5"
    : selectedQuestion?.ragResponse.verdict === "fail"
    ? "border-amber-500/35 bg-amber-500/[0.07] shadow-[0_0_24px_rgba(245,158,11,0.06)]"
    : "border-amber-500/25 bg-amber-500/[0.06]";

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Header */}
      <div className="animate-fade-up text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <h1 className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-3xl font-extrabold tracking-[-0.03em] text-transparent">
          같은 질문, 다른 답변
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          동일한 질문을 기본 RAG와 GraphRAG에 던져봅니다.
          어떤 질문에서 차이가 발생하는지 직접 확인하세요.
        </p>
      </div>

      {/* 진행 프로그레스 바 */}
      {viewedIds.size > 0 && (
        <div className="animate-fade-up mx-auto max-w-md">
          <div className="mb-1.5 flex items-center justify-between text-[0.6rem] text-muted-foreground">
            <span>{viewedIds.size}/{demoQuestions.length} 질문 완료</span>
            {allViewed && <span className="font-medium text-primary">모두 완료!</span>}
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-[var(--forge-surface-raised)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-700 ease-out"
              style={{ width: `${(viewedIds.size / demoQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="animate-fade-up grid gap-8 lg:grid-cols-[280px_1fr]" style={{ animationDelay: "0.08s" }}>
        {/* Left: 질문 목록 (난이도 색상 + 진행 추적) */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">질문 선택</h2>
          {categoryOrder.map((catKey) => {
            const cat = categoryDescriptions[catKey];
            const questions = demoQuestions.filter((q) => q.category === catKey);
            const diffColor = difficultyColors[catKey];
            if (questions.length === 0) return null;
            return (
              <div key={catKey}>
                <div className="mb-1.5 flex items-center gap-2">
                  {/* 난이도 색상 인디케이터 */}
                  <div
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: diffColor, boxShadow: `0 0 6px ${diffColor}40` }}
                  />
                  <span className="text-xs font-semibold">{cat.label}</span>
                  {/* RAG 능력 배지 */}
                  <span
                    className="rounded-md px-1.5 py-0.5 text-[0.55rem] font-medium"
                    style={{
                      backgroundColor: `${diffColor}12`,
                      color: diffColor,
                      border: `1px solid ${diffColor}20`,
                    }}
                  >
                    {cat.ragCapability}
                  </span>
                </div>
                <div className="space-y-1">
                  {questions.map((q) => {
                    const isViewed = viewedIds.has(q.id);
                    return (
                      <button
                        key={q.id}
                        onClick={() => handleSelect(q.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs leading-relaxed transition-all duration-150 ${
                          selectedId === q.id
                            ? "border border-primary/30 bg-primary/10 text-primary"
                            : "border border-transparent text-muted-foreground hover:bg-[var(--forge-surface-raised)] hover:text-foreground"
                        }`}
                      >
                        {/* 완료 상태 */}
                        {isViewed ? (
                          <Check className="h-3 w-3 flex-shrink-0 text-emerald-400" />
                        ) : (
                          <div className="h-3 w-3 flex-shrink-0 rounded-full border border-muted-foreground/20" />
                        )}
                        <span className="flex-1">{q.question}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: 비교 결과 */}
        <div className="min-h-[400px]">
          {selectedQuestion ? (
            <div className="space-y-4">
              {/* 현재 질문 헤더 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: difficultyColors[selectedQuestion.category] }}
                  />
                  <h3 className="text-sm font-semibold">{selectedQuestion.question}</h3>
                </div>
                {(!ragDone || !graphragDone) && (
                  <button
                    onClick={() => setSkipTyping(true)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--forge-border-subtle)] px-2.5 py-1 text-[0.65rem] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <SkipForward className="h-3 w-3" />
                    스킵
                  </button>
                )}
              </div>

              {/* Side-by-side 패널 (데스크톱) — verdict 기반 시각 차별화 */}
              <div className="hidden gap-4 md:grid md:grid-cols-2">
                {/* RAG 패널 */}
                <div className={`rounded-xl border p-5 transition-all duration-500 ${ragPanelClass} ${ragDimmed ? "opacity-70" : ""}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className={`text-sm font-bold transition-colors duration-500 ${ragDimmed ? "text-red-400/70" : "text-blue-400"}`}>
                      기본 RAG
                    </h3>
                    {ragDone && (
                      <VerdictBadge verdict={selectedQuestion.ragResponse.verdict} label={selectedQuestion.ragResponse.verdictLabel} />
                    )}
                  </div>
                  <div className="min-h-[140px] text-sm leading-[1.8] text-muted-foreground">
                    <TypingText text={selectedQuestion.ragResponse.text} onComplete={() => setRagDone(true)} skip={skipTyping} />
                  </div>
                  {ragDone && (
                    <p className={`mt-3 text-xs transition-colors duration-500 ${ragDimmed ? "text-red-400/40" : "text-blue-400/70"}`}>
                      {selectedQuestion.ragResponse.verdictDetail}
                    </p>
                  )}
                </div>

                {/* GraphRAG 패널 */}
                <div className={`rounded-xl border p-5 transition-all duration-500 ${graphragPanelClass}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-400">GraphRAG</h3>
                    {graphragDone && (
                      <VerdictBadge verdict={selectedQuestion.graphragResponse.verdict} label={selectedQuestion.graphragResponse.verdictLabel} />
                    )}
                  </div>
                  <div className="min-h-[140px] text-sm leading-[1.8] text-muted-foreground">
                    <TypingText text={selectedQuestion.graphragResponse.text} onComplete={() => setGraphragDone(true)} skip={skipTyping} />
                  </div>
                  {graphragDone && (
                    <p className="mt-3 text-xs text-amber-400/70">{selectedQuestion.graphragResponse.verdictDetail}</p>
                  )}
                </div>
              </div>

              {/* 모바일: 탭 뷰 */}
              <MobileTabView question={selectedQuestion} />

              {/* 핵심 차이 — 강화된 카드 */}
              {ragDone && graphragDone && (
                <div className="animate-fade-up rounded-xl border border-primary/25 bg-primary/[0.04] p-5 shadow-[0_0_30px_rgba(245,158,11,0.06)]">
                  <div className="mb-2 flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
                      <Lightbulb className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h4 className="text-sm font-bold text-primary">핵심 차이</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/85">{selectedQuestion.keyDifference}</p>
                </div>
              )}

              {/* 다음 질문 제안 또는 완료 카드 */}
              {ragDone && graphragDone && (
                allViewed ? (
                  <CompletionCard />
                ) : (
                  <NextQuestionSuggestion currentId={selectedId!} viewedIds={viewedIds} onSelect={handleSelect} />
                )
              )}
            </div>
          ) : (
            <EmptyState onSelectFirst={() => handleSelect(demoQuestions[0].id)} />
          )}
        </div>
      </div>
    </div>
  );
}
