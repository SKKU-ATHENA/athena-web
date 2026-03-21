import { cn } from "@/lib/utils";

const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
  "official-docs": {
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    label: "공식 문서",
  },
  github: {
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "GitHub",
  },
  youtube: {
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-red-600 dark:text-red-400",
    label: "YouTube",
  },
  paper: {
    bg: "bg-purple-500/10 border-purple-500/20",
    text: "text-purple-700 dark:text-purple-400",
    label: "논문",
  },
};

interface SourceBadgeProps {
  type: string;
  label: string;
  url: string;
}

export function SourceBadge({ type, label, url }: SourceBadgeProps) {
  const config = typeConfig[type] || {
    bg: "bg-muted border-border",
    text: "text-muted-foreground",
    label: type,
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.04em] transition-opacity hover:opacity-80",
        config.bg,
        config.text
      )}
    >
      {config.label} — {label}
      <span className="sr-only"> (새 창에서 열림)</span>
    </a>
  );
}
