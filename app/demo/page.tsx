"use client";

import { useState, useEffect, useRef } from "react";
import { Zap, SkipForward, ChevronDown } from "lucide-react";
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
    const charsPerTick = Math.max(1, Math.ceil(text.length / 100));
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
  const colors = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    partial: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    fail: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${colors[verdict as keyof typeof colors] || colors.fail}`}>
      {label}
    </span>
  );
}

export default function DemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [skipTyping, setSkipTyping] = useState(false);
  const [ragDone, setRagDone] = useState(false);
  const [graphragDone, setGraphragDone] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedQuestion = demoQuestions.find((q) => q.id === selectedId);

  function handleSelect(id: string) {
    setSelectedId(id);
    setSkipTyping(false);
    setRagDone(false);
    setGraphragDone(false);
    setDropdownOpen(false);
  }

  const categories = Object.entries(categoryDescriptions);

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

      {/* Question Selector */}
      <div className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-[var(--forge-border)] bg-[var(--forge-surface)] px-4 py-3 text-left text-sm transition-colors hover:border-primary/50"
          >
            <span className={selectedQuestion ? "text-foreground" : "text-muted-foreground"}>
              {selectedQuestion ? selectedQuestion.question : "질문을 선택하세요..."}
            </span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-[var(--forge-border)] bg-[var(--forge-surface)] shadow-xl">
              {categories.map(([key, cat]) => {
                const questions = demoQuestions.filter((q) => q.category === key);
                if (questions.length === 0) return null;
                return (
                  <div key={key}>
                    <div className="sticky top-0 bg-[var(--forge-surface-raised)] px-4 py-2 text-xs font-semibold text-muted-foreground">
                      {cat.label} — {cat.ragCapability}
                    </div>
                    {questions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleSelect(q.id)}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary/5 ${
                          selectedId === q.id ? "bg-primary/10 text-primary" : ""
                        }`}
                      >
                        {q.question}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Area */}
      {selectedQuestion ? (
        <div className="animate-fade-up space-y-4" style={{ animationDelay: "0.12s" }}>
          {/* Skip button */}
          {(!ragDone || !graphragDone) && (
            <div className="text-center">
              <button
                onClick={() => setSkipTyping(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--forge-border-subtle)] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <SkipForward className="h-3 w-3" />
                스킵
              </button>
            </div>
          )}

          {/* Side-by-side panels (desktop) / Tabs (mobile) */}
          <div className="hidden gap-4 md:grid md:grid-cols-2">
            {/* RAG Panel */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-400">기본 RAG</h3>
                {ragDone && <VerdictBadge verdict={selectedQuestion.ragResponse.verdict} label={selectedQuestion.ragResponse.verdictLabel} />}
              </div>
              <div className="min-h-[120px] text-sm leading-relaxed text-muted-foreground">
                <TypingText
                  text={selectedQuestion.ragResponse.text}
                  onComplete={() => setRagDone(true)}
                  skip={skipTyping}
                />
              </div>
              {ragDone && (
                <p className="mt-3 text-xs text-blue-400/70">{selectedQuestion.ragResponse.verdictDetail}</p>
              )}
            </div>

            {/* GraphRAG Panel */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-400">GraphRAG</h3>
                {graphragDone && <VerdictBadge verdict={selectedQuestion.graphragResponse.verdict} label={selectedQuestion.graphragResponse.verdictLabel} />}
              </div>
              <div className="min-h-[120px] text-sm leading-relaxed text-muted-foreground">
                <TypingText
                  text={selectedQuestion.graphragResponse.text}
                  onComplete={() => setGraphragDone(true)}
                  skip={skipTyping}
                />
              </div>
              {graphragDone && (
                <p className="mt-3 text-xs text-amber-400/70">{selectedQuestion.graphragResponse.verdictDetail}</p>
              )}
            </div>
          </div>

          {/* Mobile: Tab view */}
          <MobileTabView question={selectedQuestion} skipTyping={skipTyping} />

          {/* Key Difference */}
          {ragDone && graphragDone && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <h4 className="mb-1 text-xs font-semibold text-primary">핵심 차이</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {selectedQuestion.keyDifference}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Initial state: category cards */
        <div className="animate-fade-up grid gap-3 sm:grid-cols-2" style={{ animationDelay: "0.12s" }}>
          {categories.map(([key, cat]) => (
            <div
              key={key}
              className="rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{cat.label}</span>
                <span className="text-xs text-muted-foreground">{cat.ragCapability}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{cat.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileTabView({ question, skipTyping }: { question: DemoQuestion; skipTyping: boolean }) {
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
          <p className="text-sm leading-relaxed text-muted-foreground">
            {skipTyping ? question.ragResponse.text : question.ragResponse.text}
          </p>
          <p className="mt-2 text-xs text-blue-400/70">{question.ragResponse.verdictDetail}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-bold text-amber-400">GraphRAG</h3>
            <VerdictBadge verdict={question.graphragResponse.verdict} label={question.graphragResponse.verdictLabel} />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {skipTyping ? question.graphragResponse.text : question.graphragResponse.text}
          </p>
          <p className="mt-2 text-xs text-amber-400/70">{question.graphragResponse.verdictDetail}</p>
        </div>
      )}
    </div>
  );
}
