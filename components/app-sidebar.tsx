"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FlaskConical,
  Layers,
  Database,
  FileText,
  Brain,
  Network,
  Settings,
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

const studyIcons: Record<string, React.ElementType> = {
  "embedding-concepts": Layers,
  "vector-db-comparison": Database,
  "rag-architecture": FileText,
  "llm-options": Brain,
  "graphrag-concepts": Network,
  "environment-setup": Settings,
};

export function AppSidebar() {
  const pathname = usePathname();

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
        <SidebarGroup>
          <SidebarGroupLabel>사전 과제</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/pre-assignment"}
                >
                  <Link href="/pre-assignment">
                    <FlaskConical className="size-4" />
                    <span>내 손으로 만드는 RAG</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-[var(--forge-border-subtle)]" />

        <SidebarGroup>
          <SidebarGroupLabel>학습 자료</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studyMaterials.map((item) => {
                const Icon = studyIcons[item.slug] || FileText;
                return (
                  <SidebarMenuItem key={item.slug}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/study/${item.slug}`}
                    >
                      <Link href={`/study/${item.slug}`}>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
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
        <div className="px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.06em] text-muted-foreground/70">
          ATHENA &copy; 2026
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
