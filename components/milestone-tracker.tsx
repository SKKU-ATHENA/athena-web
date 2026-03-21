"use client";

import { Check } from "lucide-react";
import { milestones } from "@/lib/milestones";
import { cn } from "@/lib/utils";

export function MilestoneTracker() {
  return (
    <div className="w-full">
      <h2 className="mb-5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        프로젝트 마일스톤
      </h2>
      <div className="flex items-center justify-between">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300",
                  milestone.status === "completed" &&
                    "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(34,184,207,0.35)]",
                  milestone.status === "in-progress" &&
                    "border-2 border-primary bg-[var(--forge-glow)] text-primary",
                  milestone.status === "upcoming" &&
                    "border border-[var(--forge-border-subtle)] text-muted-foreground/40"
                )}
              >
                {milestone.status === "completed" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  milestone.label
                )}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "font-mono text-[0.65rem] font-semibold uppercase tracking-wide",
                    milestone.status === "completed" && "text-primary",
                    milestone.status === "in-progress" && "text-primary",
                    milestone.status === "upcoming" && "text-muted-foreground/40"
                  )}
                >
                  {milestone.label}
                </p>
                <p className="text-[10px] text-muted-foreground/50">
                  {milestone.period}
                </p>
              </div>
            </div>
            {index < milestones.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-px flex-1",
                  milestone.status === "completed"
                    ? "bg-primary/50"
                    : "bg-[var(--forge-border-subtle)]"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
