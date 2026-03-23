"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bot, ExternalLink, Loader2, RefreshCw } from "lucide-react";

const PROTOTYPE_URL = "https://athena-protov1.onrender.com/";

export default function PrototypePage() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [elapsed, setElapsed] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 로딩 중 경과 시간 카운터
  useEffect(() => {
    if (status !== "loading") return;
    setElapsed(0);
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const handleLoad = useCallback(() => {
    setStatus("ready");
  }, []);

  const handleRetry = useCallback(() => {
    setStatus("loading");
    if (iframeRef.current) {
      iframeRef.current.src = PROTOTYPE_URL;
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-4">
      {/* Header */}
      <div className="animate-fade-up flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">프로토타입 체험</h1>
            <p className="text-xs text-muted-foreground">
              ATHENA PROTOv1 — Chainlit 기반 Knowledge Graph 챗봇
            </p>
          </div>
        </div>
        <a
          href={PROTOTYPE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--forge-border-subtle)] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
        >
          <ExternalLink className="h-3 w-3" />
          새 탭에서 열기
        </a>
      </div>

      {/* iframe 컨테이너 */}
      <div
        className="animate-fade-up relative overflow-hidden rounded-xl border border-[var(--forge-border-subtle)]"
        style={{ animationDelay: "0.08s" }}
      >
        {/* 로딩 오버레이 */}
        {status === "loading" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--forge-surface)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm font-medium">프로토타입 서버를 깨우는 중...</p>
            <p className="mt-1 text-xs text-muted-foreground">
              무료 서버라 첫 로딩에 30~50초 걸릴 수 있습니다
            </p>
            <div className="mt-3 font-mono text-xs text-muted-foreground/60">
              {elapsed}초 경과
            </div>
            {elapsed > 20 && (
              <p className="mt-2 max-w-xs text-center text-[0.65rem] text-amber-400/70">
                Render 무료 서버가 cold start 중입니다. 조금만 더 기다려주세요.
              </p>
            )}
            {elapsed > 60 && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-1.5 text-xs text-primary hover:bg-primary/5"
                >
                  <RefreshCw className="h-3 w-3" />
                  다시 시도
                </button>
                <a
                  href={PROTOTYPE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--forge-border-subtle)] px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                  직접 방문
                </a>
              </div>
            )}
          </div>
        )}

        {/* 에러 상태 */}
        {status === "error" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--forge-surface)]">
            <p className="text-sm font-medium text-red-400">서버에 연결할 수 없습니다</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Render 무료 서버가 비활성화 상태일 수 있습니다
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
              >
                <RefreshCw className="h-3 w-3" />
                다시 시도
              </button>
              <a
                href={PROTOTYPE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--forge-border-subtle)] px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                직접 방문
              </a>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={PROTOTYPE_URL}
          className="h-[calc(100vh-220px)] w-full min-h-[500px] transition-opacity duration-500"
          style={{ opacity: status === "ready" ? 1 : 0 }}
          onLoad={handleLoad}
          onError={() => setStatus("error")}
          allow="clipboard-read; clipboard-write"
          title="ATHENA PROTOv1"
        />
      </div>

      {/* 사용 힌트 */}
      <div
        className="animate-fade-up grid gap-3 sm:grid-cols-3"
        style={{ animationDelay: "0.12s" }}
      >
        {[
          {
            cmd: "자유 질문",
            desc: "질문을 입력하면 Knowledge Graph에서 인과 사슬로 답변합니다",
          },
          {
            cmd: "/graph",
            desc: "현재 지식 그래프의 노드·엣지 통계를 확인합니다",
          },
          {
            cmd: "/record [내용]",
            desc: "새로운 의사결정 기록(ADR)을 수동으로 추가합니다",
          },
        ].map((hint) => (
          <div
            key={hint.cmd}
            className="rounded-lg border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-3"
          >
            <code className="text-xs font-semibold text-primary">{hint.cmd}</code>
            <p className="mt-1 text-[0.65rem] leading-relaxed text-muted-foreground">
              {hint.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
