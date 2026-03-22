"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { isCompleted, setProgress } from "@/lib/progress";

export function StudyCompletion({ slug }: { slug: string }) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(isCompleted(slug));
  }, [slug]);

  function handleToggle() {
    const next = !completed;
    setCompleted(next);
    setProgress(slug, next);
    // Trigger sidebar re-render by dispatching storage event
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
        completed
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-[var(--forge-border)] bg-[var(--forge-surface)] text-muted-foreground hover:border-primary/30 hover:text-primary"
      }`}
    >
      {completed ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          학습 완료!
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" />
          학습 완료 표시
        </>
      )}
    </button>
  );
}
