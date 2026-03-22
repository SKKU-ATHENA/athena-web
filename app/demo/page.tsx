"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Zap, SkipForward } from "lucide-react";
import { demoQuestions, categoryDescriptions, type DemoQuestion } from "@/lib/data/demo-comparisons";

function TypingText({ text, onComplete, skip }: { text: string; onComplete: () => void; skip: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (skip) {
      setDisplayed(text);
      onCompleteRef.current();
      return;
    }
    indexRef.current = 0;
    setDisplayed("");
    const duration = text.length < 100 ? 1000 : 2000; // 짧은 텍스트 1초, 긴 텍스트 2초
    const charsPerTick = Math.max(1, Math.ceil(text.length / (duration / 30)));
    const timer = setInterval(() => {
      indexRef.current += charsPerTick;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        clearInterval(timer);
        onCompleteRef.current();
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, 50);
    return () => clearInterval(timer);
  }, [text, skip]);

  return <span style={{ whiteSpace: "pre-wrap" }}>{displayed}</span>;
}

function VerdictBadge({ verdict, label }: { verdict: string; label: string }) {
  const colors: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    partial: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    fail: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${colors[verdict] || colors.fail}`}>
      {label}
    </span>
  );
}

const categoryOrder = ["fact", "simple", "comparison", "causal", "summary"] as const;

export default function DemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [skipTyping, setSkipTyping] = useState(false);
  const [ragDone, setRagDone] = useState(false);
  const [graphragDone, setGraphragDone] = useState(false);

  const selectedQuestion = demoQuestions.find((q) => q.id === selectedId);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setSkipTyping(false);
    setRagDone(false);
    setGraphragDone(false);
  }, []);

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

      <div className="animate-fade-up grid gap-8 lg:grid-cols-[280px_1fr]" style={{ animationDelay: "0.08s" }}>
        {/* Left: Question List */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">질문 선택</h2>
          {categoryOrder.map((catKey) => {
            const cat = categoryDescriptions[catKey];
            const questions = demoQuestions.filter((q) => q.category === catKey);
            if (questions.length === 0) return null;
            return (
              <div key={catKey}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-xs font-semibold">{cat.label}</span>
                  <span className="text-[0.6rem] text-muted-foreground">{cat.ragCapability}</span>
                </div>
                <div className="space-y-1">
                  {questions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleSelect(q.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs leading-relaxed transition-all duration-150 ${
                        selectedId === q.id
                          ? "border border-primary/30 bg-primary/10 text-primary"
                          : "border border-transparent text-muted-foreground hover:bg-[var(--forge-surface-raised)] hover:text-foreground"
                      }`}
                    >
                      {q.question}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Comparison Result */}
        <div className="min-h-[400px]">
          {selectedQuestion ? (
            <div className="space-y-4">
              {/* Current question */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{selectedQuestion.question}</h3>
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

              {/* Side-by-side panels (desktop) */}
              <div className="hidden gap-4 md:grid md:grid-cols-2">
                {/* RAG */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-blue-400">기본 RAG</h3>
                    {ragDone && <VerdictBadge verdict={selectedQuestion.ragResponse.verdict} label={selectedQuestion.ragResponse.verdictLabel} />}
                  </div>
                  <div className="min-h-[140px] text-sm leading-[1.8] text-muted-foreground">
                    <TypingText text={selectedQuestion.ragResponse.text} onComplete={() => setRagDone(true)} skip={skipTyping} />
                  </div>
                  {ragDone && <p className="mt-3 text-xs text-blue-400/70">{selectedQuestion.ragResponse.verdictDetail}</p>}
                </div>

                {/* GraphRAG */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-400">GraphRAG</h3>
                    {graphragDone && <VerdictBadge verdict={selectedQuestion.graphragResponse.verdict} label={selectedQuestion.graphragResponse.verdictLabel} />}
                  </div>
                  <div className="min-h-[140px] text-sm leading-[1.8] text-muted-foreground">
                    <TypingText text={selectedQuestion.graphragResponse.text} onComplete={() => setGraphragDone(true)} skip={skipTyping} />
                  </div>
                  {graphragDone && <p className="mt-3 text-xs text-amber-400/70">{selectedQuestion.graphragResponse.verdictDetail}</p>}
                </div>
              </div>

              {/* Mobile: Tab view */}
              <MobileTabView question={selectedQuestion} />

              {/* Key Difference */}
              {ragDone && graphragDone && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <h4 className="mb-1 text-xs font-semibold text-primary">핵심 차이</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{selectedQuestion.keyDifference}</p>
                </div>
              )}
            </div>
          ) : (
            /* Initial state: guide */
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-6">
              {/* 비교 프리뷰 카드 */}
              <div className="grid w-full max-w-md grid-cols-2 gap-3">
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
              <div className="text-center">
                <p className="text-xs text-muted-foreground">← 왼쪽에서 질문을 선택하면 비교가 시작됩니다</p>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {categoryOrder.map((catKey) => {
                    const cat = categoryDescriptions[catKey];
                    return (
                      <span key={catKey} className="rounded-full border border-white/8 bg-white/[0.02] px-2.5 py-1 text-[0.55rem] text-muted-foreground">
                        {cat.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileTabView({ question }: { question: DemoQuestion }) {
  const [activeTab, setActiveTab] = useState<"rag" | "graphrag">("rag");

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
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-bold text-blue-400">기본 RAG</h3>
            <VerdictBadge verdict={question.ragResponse.verdict} label={question.ragResponse.verdictLabel} />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{question.ragResponse.text}</p>
          <p className="mt-2 text-xs text-blue-400/70">{question.ragResponse.verdictDetail}</p>
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
