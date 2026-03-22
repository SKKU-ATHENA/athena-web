"use client";

import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const KGExplorer = dynamic(() => import("@/components/kg-explorer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)]">
      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-40 w-40 rounded-full" />
        <p className="text-xs text-muted-foreground">Knowledge Graph 로딩 중...</p>
      </div>
    </div>
  ),
});

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
          <Search className="h-6 w-6 text-primary" />
        </div>
        <h1 className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-3xl font-extrabold tracking-[-0.03em] text-transparent">
          Knowledge Graph 탐색기
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          ATHENA 프로젝트의 개념, 기술, 의사결정이 어떻게 연결되어 있는지 탐색하세요.
        </p>
      </div>

      {/* KG Explorer (client-only, dynamic import) */}
      <div className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
        <KGExplorer />
      </div>
    </div>
  );
}
