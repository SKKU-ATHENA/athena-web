const STORAGE_KEY = "athena-study-progress";

export type ProgressMap = Record<string, boolean>;

export function getProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setItemComplete(slug: string, complete: boolean) {
  const progress = getProgress();
  if (complete) {
    progress[slug] = true;
  } else {
    delete progress[slug];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return progress;
}

export function isComplete(slug: string): boolean {
  return getProgress()[slug] === true;
}

export function getCompletionCount(slugs: string[]): number {
  const progress = getProgress();
  return slugs.filter((s) => progress[s]).length;
}

export function getCompletionPercent(slugs: string[]): number {
  if (slugs.length === 0) return 0;
  return Math.round((getCompletionCount(slugs) / slugs.length) * 100);
}
