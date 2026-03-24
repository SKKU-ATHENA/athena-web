import Link from "next/link";
import {
  Map,
  Clock,
  BookOpen,
  ChevronRight,
  ArrowRight,
  FlaskConical,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { phases, studyMaterials, getModulesByPhase } from "@/lib/curriculum";
import { getStudyIcon } from "@/lib/icons";

const difficultyColor: Record<string, string> = {
  "입문": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "기본": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "중급": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "심화": "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

function getTotalReadingTime(): number {
  let total = 0;
  for (const m of studyMaterials) {
    const match = m.readingTime.match(/(\d+)/);
    if (match) total += parseInt(match[1], 10);
  }
  return total;
}

export default function CurriculumPage() {
  const modulesByPhase = getModulesByPhase();
  const totalTime = getTotalReadingTime();

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
            <Map className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            학습 로드맵
          </h1>
        </div>
        <p className="mt-3 text-lg text-muted-foreground">
          ATHENA 프로젝트에 필요한 지식을 단계별로 쌓아간다.
          Phase 0부터 순서대로 따라가면 된다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
            <BookOpen className="mr-1 inline h-3 w-3" />
            {studyMaterials.length}개 모듈
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
            <Clock className="mr-1 inline h-3 w-3" />
            총 {totalTime}분
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
            {phases.length}개 Phase
          </span>
        </div>
      </div>

      {/* Phase Flow Summary */}
      <div className="overflow-hidden rounded-xl border border-border bg-[var(--forge-surface)] p-6">
        <div className="mb-4 text-xs font-semibold text-muted-foreground">
          학습 흐름
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {phases.map((phase, i) => (
            <div key={phase.phase} className="flex items-center gap-2">
              <div
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  phase.phase === 4
                    ? "border border-dashed border-border text-muted-foreground"
                    : "bg-primary/15 text-primary"
                }`}
              >
                P{phase.phase}: {phase.title}
              </div>
              {i < phases.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          각 Phase는 이전 Phase의 개념 위에 쌓인다. 순서대로 학습하는 것을 권장한다.
        </p>
      </div>

      <Separator className="opacity-50" />

      {/* Phase Timeline */}
      <div className="relative space-y-8">
        {phases.map((phase) => {
          const modules = modulesByPhase.get(phase.phase) || [];
          const isLocked = phase.phase === 4;

          return (
            <section key={phase.phase} className="relative">
              {/* Timeline connector */}
              {phase.phase < phases.length - 1 && (
                <div className="absolute left-[19px] top-[48px] bottom-[-32px] w-px bg-border" />
              )}

              {/* Phase Header */}
              <div className="flex items-start gap-4">
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isLocked
                      ? "border-2 border-dashed border-muted-foreground/30 bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                  }`}
                >
                  {isLocked ? <Lock className="h-4 w-4" /> : phase.phase}
                </div>
                <div className="flex-1 pt-1">
                  <h2 className="text-xl font-bold tracking-tight">
                    Phase {phase.phase}: {phase.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {phase.description}
                  </p>
                </div>
                {!isLocked && modules.length > 0 && (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-primary/30 text-primary"
                  >
                    {modules.length}개 모듈
                  </Badge>
                )}
              </div>

              {/* Locked Phase */}
              {isLocked && (
                <div className="ml-14 mt-4">
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                    <Lock className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">
                      준비 중
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Phase 3 완료 후 공개됩니다
                    </p>
                  </div>
                </div>
              )}

              {/* Module Cards */}
              {!isLocked && modules.length > 0 && (
                <div className="ml-14 mt-4 grid gap-3">
                  {modules.map((module) => {
                    const Icon = getStudyIcon(module.icon);
                    const isSupplementary = module.isSupplementary;

                    return (
                      <Link
                        key={module.slug}
                        href={`/study/${module.slug}`}
                        className="group block"
                      >
                        <Card
                          className={`transition-all hover:shadow-md hover:border-primary/30 ${
                            isSupplementary
                              ? "border-dashed border-border/60 bg-muted/20"
                              : "shadow-[0_22px_70px_-34px_rgba(34,27,20,0.08)] backdrop-blur-sm"
                          }`}
                        >
                          <CardContent className="flex items-start gap-4 p-4">
                            {/* Order Number */}
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                isSupplementary
                                  ? "border border-dashed border-border bg-muted text-muted-foreground"
                                  : "bg-primary/10 text-primary dark:bg-primary/20"
                              }`}
                            >
                              {isSupplementary ? "+" : module.order}
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <h3
                                  className={`font-semibold tracking-tight group-hover:text-primary transition-colors ${
                                    isSupplementary
                                      ? "text-sm text-muted-foreground"
                                      : "text-sm"
                                  }`}
                                >
                                  {isSupplementary && "보충: "}
                                  {module.title}
                                </h3>
                                {module.isNew && (
                                  <Badge
                                    variant="outline"
                                    className="border-primary/30 px-1.5 text-[0.6rem] text-primary"
                                  >
                                    NEW
                                  </Badge>
                                )}
                              </div>

                              {/* Meta info */}
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[0.6rem] font-medium ${
                                    difficultyColor[module.difficulty] || ""
                                  }`}
                                >
                                  {module.difficulty}
                                </span>
                                <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {module.readingTime}
                                </span>
                              </div>

                              {/* ATHENA Connection */}
                              {module.athenaConnection && (
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80">
                                  <Sparkles className="mr-1 inline h-3 w-3 text-primary/60" />
                                  {module.athenaConnection}
                                </p>
                              )}
                            </div>

                            {/* Arrow */}
                            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <Separator className="opacity-50" />

      {/* Pre-assignment CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 dark:bg-primary/10">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold tracking-tight">사전 과제</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Phase 0~2를 학습한 후 사전 과제를 진행하세요.
              RAG 파이프라인을 직접 조립하고 GraphRAG와 비교하는 실습입니다.
            </p>
            <Link
              href="/pre-assignment"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              사전 과제 바로가기
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
