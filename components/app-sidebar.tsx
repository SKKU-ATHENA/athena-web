"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  FlaskConical,
  Layers,
  Database,
  FileText,
  Brain,
  Network,
  Settings,
  Zap,
  Search,
  LayoutDashboard,
  Users,
  CheckCircle2,
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
import { studyMaterials } from "@/lib/curriculum";
import { getProgress } from "@/lib/progress";

const studyIcons: Record<string, React.ElementType> = {
  "embedding-concepts": Layers,
  "vector-db-comparison": Database,
  "rag-architecture": FileText,
  "llm-options": Brain,
  "graphrag-concepts": Network,
  "environment-setup": Settings,
};

const mainNavItems = [
  { href: "/pre-assignment", label: "내 손으로 만드는 RAG", icon: FlaskConical, group: "사전 과제" },
];

const showcaseItems = [
  { href: "/demo", label: "라이브 데모", icon: Zap },
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
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
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
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
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

        {/* 학습 자료 + 진행 추적 */}
        <SidebarGroup>
          <SidebarGroupLabel>학습 자료</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studyMaterials.map((item) => {
                const Icon = studyIcons[item.slug] || FileText;
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
                        <span className={completed ? "text-primary" : ""}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* 학습 진행도 */}
        <div className="px-3 py-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">학습 진행도</span>
            <span className="text-[0.6rem] text-muted-foreground">
              {Object.keys(progress).length}/{studyMaterials.length}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(Object.keys(progress).length / studyMaterials.length) * 100}%` }}
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
