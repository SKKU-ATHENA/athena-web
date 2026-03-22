import { Users } from "lucide-react";
import { teamMembers, teamInfo } from "@/lib/data/team";
import { milestones } from "@/lib/milestones";

const MILESTONE_COLORS = ["#06b6d4", "#f59e0b", "#a855f7", "#ef4444", "#22c55e"];

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
      </div>

      {/* 미션 + 기간 카드 */}
      <section className="animate-fade-up grid gap-3 sm:grid-cols-2" style={{ animationDelay: "0.04s" }}>
        <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary/70">팀 미션</h3>
          <p className="text-sm font-medium leading-relaxed">
            {teamInfo.mission}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">프로젝트 정보</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">기간</span>
              <span className="font-medium">2026년 2월~6월</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">인원</span>
              <span className="font-medium">{teamInfo.memberCount}명</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">과정</span>
              <span className="font-medium">{teamInfo.program}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 팀원 프로필 — 기술 태그 포함 */}
      <section className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
        <h2 className="mb-6 flex items-center gap-3 text-xl font-bold tracking-tight">
          <span className="h-1 w-8 rounded-full bg-primary" />
          팀원
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, idx) => (
            <div
              key={member.id}
              className="animate-fade-up group rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-5 transition-all duration-200 hover:-translate-y-[3px] hover:border-[var(--forge-border)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
              style={{ animationDelay: `${0.12 + idx * 0.04}s` }}
            >
              <div className="flex items-center gap-3">
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
                      backgroundColor: `${member.roleColor}15`,
                      color: member.roleColor,
                    }}
                  >
                    {member.role}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{member.area}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground/70">{member.bio}</p>
              {/* 기술 태그 */}
              <div className="mt-3 flex flex-wrap gap-1">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md px-1.5 py-0.5 text-[0.55rem] font-medium"
                    style={{
                      backgroundColor: `${member.roleColor}10`,
                      color: `${member.roleColor}bb`,
                      border: `1px solid ${member.roleColor}15`,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 타임라인 — 네온 스타일 + 색상 다양화 */}
      <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="mb-6 flex items-center gap-3 text-xl font-bold tracking-tight">
          <span className="h-1 w-8 rounded-full bg-primary" />
          프로젝트 타임라인
        </h2>
        <div className="rounded-2xl border border-white/5 p-6" style={{ background: "#08080a" }}>
          <div className="relative border-l-2 border-white/8 pl-8">
            {milestones.map((milestone, i) => {
              const isActive = milestone.status === "in-progress";
              const isCompleted = milestone.status === "completed";
              const color = MILESTONE_COLORS[i] || MILESTONE_COLORS[0];
              const glow = `${color}40`;

              return (
                <div key={milestone.id} className="relative pb-10 last:pb-0">
                  {/* 타임라인 점 */}
                  <div
                    className="absolute -left-[2.55rem] flex h-5 w-5 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: color,
                      backgroundColor: isCompleted ? color : "#08080a",
                      boxShadow: isActive ? `0 0 12px ${glow}` : "none",
                    }}
                  >
                    {isCompleted && (
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {isActive && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
                  </div>

                  {/* 카드 */}
                  <div
                    className="rounded-xl border p-4"
                    style={{
                      borderColor: isActive ? `${color}40` : "rgba(255,255,255,0.06)",
                      background: isActive ? `${color}06` : "#0f0f12",
                      boxShadow: isActive ? `0 0 16px ${glow}` : "none",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: isActive || isCompleted ? color : "white" }}>
                        {milestone.label}
                      </span>
                      <span className="text-xs text-white/40">{milestone.period}</span>
                      {isActive && (
                        <span className="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold"
                          style={{ backgroundColor: `${color}20`, color }}>
                          진행 중
                        </span>
                      )}
                      {isCompleted && (
                        <span className="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold"
                          style={{ backgroundColor: `${color}20`, color }}>
                          완료
                        </span>
                      )}
                    </div>
                    <ul className="mt-2 space-y-1">
                      {milestone.goals.map((goal, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-white/50">
                          <span className="h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: `${color}60` }} />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
