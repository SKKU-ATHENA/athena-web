"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { isComplete, setItemComplete } from "@/lib/progress";

export function StudyCheck({ slug }: { slug: string }) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(isComplete(slug));
  }, [slug]);

  const toggle = (val: boolean) => {
    setChecked(val);
    setItemComplete(slug, val);
    window.dispatchEvent(new Event("progress-update"));
  };

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => toggle(v === true)}
      />
      {checked ? "학습 완료!" : "학습 완료로 표시"}
    </label>
  );
}
