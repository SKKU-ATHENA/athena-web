"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

const pageTitles: Record<string, string> = {
  "/": "홈",
  "/pre-assignment": "사전 과제",
};

export function SiteHeader() {
  const pathname = usePathname();
  const isStudy = pathname.startsWith("/study/");
  const pageTitle = pageTitles[pathname] ?? (isStudy ? "학습 자료" : "");

  return (
    <header className="forge-header sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 bg-background/88 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-[var(--forge-border-subtle)]" />
      <div className="flex items-center gap-1.5 text-[0.8rem] tracking-tight">
        <span className="font-semibold text-muted-foreground">ATHENA</span>
        {pageTitle && (
          <>
            <span className="text-muted-foreground/50">/</span>
            <span className="font-medium text-foreground/80">{pageTitle}</span>
          </>
        )}
      </div>
      <div className="flex-1" />
      <ThemeToggle />
    </header>
  );
}
