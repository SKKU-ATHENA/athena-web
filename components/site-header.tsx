"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="forge-header sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 bg-background/88 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-[var(--forge-border-subtle)]" />
      <span className="text-[0.8rem] font-semibold tracking-tight text-muted-foreground">
        ATHENA
      </span>
      <div className="flex-1" />
      <ThemeToggle />
    </header>
  );
}
