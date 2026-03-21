"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { curriculum } from "@/lib/curriculum";
import { getProgress, type ProgressMap } from "@/lib/progress";

export function TrackProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(getProgress());

    const onUpdate = () => setProgress(getProgress());
    window.addEventListener("storage", onUpdate);
    window.addEventListener("progress-update", onUpdate);
    return () => {
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("progress-update", onUpdate);
    };
  }, []);

  const allSlugs = curriculum.flatMap((t) =>
    t.sections.flatMap((s) => s.items.map((i) => i.slug))
  );
  const doneCount = allSlugs.filter((s) => progress[s]).length;
  const pct = allSlugs.length ? Math.round((doneCount / allSlugs.length) * 100) : 0;

  return (
    <div>
      <Progress value={pct} className="h-2" />
      <div className="mt-1 text-right text-xs text-muted-foreground">
        {doneCount} / {allSlugs.length} 완료 ({pct}%)
      </div>
    </div>
  );
}
