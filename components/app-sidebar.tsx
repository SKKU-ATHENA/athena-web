"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpenIcon,
  BrainIcon,
  BugIcon,
  ChevronRightIcon,
  FileTextIcon,
  LayersIcon,
  LayoutIcon,
  NetworkIcon,
  BlocksIcon,
  SparklesIcon,
  TerminalIcon,
  WorkflowIcon,
  GraduationCapIcon,
  CheckCircle2Icon,
  CircleIcon,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { curriculum, type StudySection, getTrackColor } from "@/lib/curriculum";
import { getProgress, type ProgressMap } from "@/lib/progress";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  terminal: TerminalIcon,
  brain: BrainIcon,
  sparkles: SparklesIcon,
  network: NetworkIcon,
  layers: LayersIcon,
  workflow: WorkflowIcon,
  blocks: BlocksIcon,
  layout: LayoutIcon,
  "file-text": FileTextIcon,
  bug: BugIcon,
};

function SectionIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name] ?? BookOpenIcon;
  return <Icon className={className} />;
}

export function AppSidebar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(getProgress());

    const onStorage = () => setProgress(getProgress());
    window.addEventListener("storage", onStorage);
    window.addEventListener("progress-update", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("progress-update", onStorage);
    };
  }, []);

  function getTrackProgress(trackId: string) {
    const track = curriculum.find((t) => t.id === trackId);
    if (!track) return 0;
    const slugs = track.sections.flatMap((s) => s.items.map((i) => i.slug));
    if (slugs.length === 0) return 0;
    const done = slugs.filter((s) => progress[s]).length;
    return Math.round((done / slugs.length) * 100);
  }

  function getSectionProgress(section: StudySection) {
    const slugs = section.items.map((i) => i.slug);
    if (slugs.length === 0) return { done: 0, total: 0 };
    const done = slugs.filter((s) => progress[s]).length;
    return { done, total: slugs.length };
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCapIcon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">ATHENA</span>
                <span className="text-xs text-muted-foreground">
                  학습 정리
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {curriculum.map((track) => {
          const pct = getTrackProgress(track.id);
          return (
            <SidebarGroup key={track.id}>
              <SidebarGroupLabel
                className={`${getTrackColor(track.color)} font-semibold`}
              >
                {track.title}
                {track.weeks > 0 && (
                  <span className="ml-auto text-[10px] font-normal text-muted-foreground">
                    {pct}%
                  </span>
                )}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {track.sections.map((section) => {
                    const sp = getSectionProgress(section);
                    return (
                      <Collapsible key={section.id} defaultOpen>
                        <SidebarMenuItem>
                          <CollapsibleTrigger
                            render={<SidebarMenuButton />}
                          >
                              <SectionIcon
                                name={section.icon}
                                className="size-4"
                              />
                              <span>{section.title}</span>
                              <span className="ml-auto text-[10px] text-muted-foreground">
                                {sp.done}/{sp.total}
                              </span>
                              <ChevronRightIcon className="ml-1 size-3 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {section.items.map((item) => {
                                const isActive =
                                  pathname === `/study/${item.slug}`;
                                const isDone = progress[item.slug];
                                return (
                                  <SidebarMenuSubItem key={item.slug}>
                                    <SidebarMenuSubButton
                                      isActive={isActive}
                                      render={
                                        <Link href={`/study/${item.slug}`} />
                                      }
                                    >
                                      {isDone ? (
                                        <CheckCircle2Icon className="size-3.5 text-green-500 shrink-0" />
                                      ) : (
                                        <CircleIcon className="size-3.5 text-muted-foreground/40 shrink-0" />
                                      )}
                                      <span>{item.title}</span>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/posts" />}
              isActive={pathname.startsWith("/posts")}
            >
              <BookOpenIcon className="size-4" />
              <span>팀 블로그</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 pb-1 group-data-[collapsible=icon]:hidden">
          <div className="text-[10px] text-muted-foreground mb-1">
            전체 진행률
          </div>
          <Progress
            value={(() => {
              const all = curriculum.flatMap((t) =>
                t.sections.flatMap((s) => s.items.map((i) => i.slug))
              );
              if (all.length === 0) return 0;
              return Math.round(
                (all.filter((s) => progress[s]).length / all.length) * 100
              );
            })()}
            className="h-1.5"
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
