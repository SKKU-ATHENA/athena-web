import { Users } from "lucide-react";
import { teamMembers, teamInfo } from "@/lib/data/team";
import { milestones } from "@/lib/milestones";

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-16">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <h1 className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-3xl font-extrabold tracking-[-0.03em] text-transparent">
          팀 소개
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {teamInfo.university} {teamInfo.program} ({teamInfo.semester})
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {teamInfo.mission}
        </p>
      </div>

      {/* Section 2: 팀원 프로필 */}
      <section className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
        <h2 className="mb-6 text-xl font-bold tracking-tight">팀원</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, idx) => (
            <div
              key={member.id}
              className="animate-fade-up group rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-5 transition-all duration-200 hover:-translate-y-[3px] hover:border-[var(--forge-border)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
              style={{ animationDelay: `${0.12 + idx * 0.04}s` }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold"
                  style={{ borderColor: member.roleColor, color: member.roleColor }}
                >
                  {member.initial}
                </div>
                <div>
                  <h3 className="text-sm font-bold">{member.name}</h3>
                  <span
                    className="inline-block rounded-md px-1.5 py-0.5 text-[0.6rem] font-semibold"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${member.roleColor} 15%, transparent)`,
                      color: member.roleColor,
                    }}
                  >
                    {member.role}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{member.area}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground/70">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: 상세 버티컬 타임라인 */}
      <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="mb-6 text-xl font-bold tracking-tight">프로젝트 타임라인</h2>
        <div className="relative border-l-2 border-[var(--forge-border-subtle)] pl-8">
          {milestones.map((milestone) => {
            const isActive = milestone.status === "in-progress";
            const isCompleted = milestone.status === "completed";

            return (
              <div
                key={milestone.id}
                className={`relative pb-10 last:pb-0 ${isActive ? "" : ""}`}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[2.55rem] flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isActive
                        ? "border-primary bg-background shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                        : "border-[var(--forge-border-subtle)] bg-background"
                  }`}
                >
                  {isCompleted && (
                    <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {isActive && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>

                {/* Content */}
                <div className={`rounded-xl border p-4 ${
                  isActive
                    ? "border-primary/30 bg-primary/5"
                    : "border-[var(--forge-border-subtle)] bg-[var(--forge-surface)]"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isActive ? "text-primary" : ""}`}>
                      {milestone.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{milestone.period}</span>
                    {isActive && (
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[0.6rem] font-semibold text-primary">
                        진행 중
                      </span>
                    )}
                    {isCompleted && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[0.6rem] font-semibold text-emerald-400">
                        완료
                      </span>
                    )}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {milestone.goals.map((goal, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
