"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const KGExplorer = dynamic(() => import("@/components/kg-explorer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center" style={{ height: "calc(100vh - 120px)" }}>
      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-32 w-32 rounded-full" />
        <p className="text-xs text-muted-foreground">Knowledge Graph 로딩 중...</p>
      </div>
    </div>
  ),
});

export default function ExplorePage() {
  return (
    <div className="-mx-5 -my-6 md:-mx-8 md:-my-8">
      <KGExplorer />
    </div>
  );
}
