"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  FlaskConical,
  Zap,
  Search,
  LayoutDashboard,
  Users,
  Bot,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { studyMaterials, phases } from "@/lib/curriculum";
import { getProgress } from "@/lib/progress";
import { getStudyIcon } from "@/lib/icons";

const mainNavItems = [
  { href: "/pre-assignment", label: "내 손으로 만드는 RAG", icon: FlaskConical },
];

const showcaseItems = [
  { href: "/demo", label: "라이브 데모", icon: Zap },
  { href: "/prototype", label: "프로토타입 체험", icon: Bot },
  { href: "/explore", label: "KG 탐색기", icon: Search },
  { href: "/architecture", label: "아키텍처", icon: LayoutDashboard },
  { href: "/team", label: "팀 소개", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [progress, setProgressState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setProgressState(getProgress());
  }, [pathname]);

  // 현재 보고 있는 모듈의 Phase
  const currentSlug = pathname.startsWith("/study/") ? pathname.split("/study/")[1] : null;
  const currentPhase = currentSlug
    ? studyMaterials.find((m) => m.slug === currentSlug)?.phase
    : undefined;

  // 미완료 모듈이 있는 첫 번째 Phase
  const firstIncompletePhase = useMemo(() => {
    for (const phase of phases) {
      const phaseModules = studyMaterials.filter((m) => m.phase === phase.phase);
      if (phaseModules.some((m) => !progress[m.slug])) {
        return phase.phase;
      }
    }
    return 0;
  }, [progress]);

  // Phase별 모듈 그룹핑
  const modulesByPhase = useMemo(() => {
    const grouped = new Map<number, typeof studyMaterials>();
    for (const m of studyMaterials) {
      const list = grouped.get(m.phase) || [];
      list.push(m);
      grouped.set(m.phase, list);
    }
    return grouped;
  }, []);

  // 총 완료 수 (studyMaterials에 있는 slug만 카운트)
  const completedCount = studyMaterials.filter((m) => progress[m.slug]).length;

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                  <BookOpen className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold tracking-[-0.02em]">ATHENA</span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">
                    학습 허브
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* 사전 과제 */}
        <SidebarGroup>
          <SidebarGroupLabel>사전 과제</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-[var(--forge-border-subtle)]" />

        {/* 프로젝트 쇼케이스 */}
        <SidebarGroup>
          <SidebarGroupLabel>프로젝트</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {showcaseItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-[var(--forge-border-subtle)]" />

        {/* 학습 자료 — Phase별 Collapsible 그룹 */}
        <SidebarGroup>
          <SidebarGroupLabel>학습 자료</SidebarGroupLabel>
          <SidebarGroupContent>
            {phases.map((phase) => {
              const modules = modulesByPhase.get(phase.phase);
              if (!modules || modules.length === 0) return null;

              const phaseCompleted = modules.filter((m) => progress[m.slug]).length;
              const isCurrentPhase = currentPhase === phase.phase;
              const isFirstIncomplete = firstIncompletePhase === phase.phase;
              const defaultOpen = isCurrentPhase || isFirstIncomplete;

              return (
                <Collapsible key={phase.phase} defaultOpen={defaultOpen}>
                  <CollapsibleTrigger className="group flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                    <ChevronRight className="size-3 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
                    <span className="flex-1 text-left">Phase {phase.phase}: {phase.title}</span>
                    <span className="shrink-0 text-[0.6rem] tabular-nums opacity-60">
                      {phaseCompleted}/{modules.length}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu className="ml-1 border-l border-[var(--forge-border-subtle)] pl-2">
                      {modules.map((item) => {
                        const Icon = getStudyIcon(item.icon);
                        const completed = progress[item.slug];
                        return (
                          <SidebarMenuItem key={item.slug}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === `/study/${item.slug}`}
                            >
                              <Link href={`/study/${item.slug}`}>
                                {completed ? (
                                  <CheckCircle2 className="size-4 text-primary" />
                                ) : (
                                  <Icon className="size-4" />
                                )}
                                <span className={`${completed ? "text-primary" : ""} ${item.isSupplementary ? "opacity-60" : ""}`}>
                                  {item.isSupplementary ? `↳ ${item.title}` : item.title}
                                </span>
                                {item.isNew && (
                                  <Badge variant="outline" className="ml-auto h-4 border-primary/30 px-1 text-[0.5rem] text-primary">
                                    NEW
                                  </Badge>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-3 py-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">학습 진행도</span>
            <span className="text-[0.6rem] text-muted-foreground">
              {completedCount}/{studyMaterials.length}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(completedCount / studyMaterials.length) * 100}%` }}
            />
          </div>
        </div>
        <SidebarSeparator className="bg-[var(--forge-border-subtle)]" />
        <div className="px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.06em] text-muted-foreground/70">
          ATHENA &copy; 2026
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
