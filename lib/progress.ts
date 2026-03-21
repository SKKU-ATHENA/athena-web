"use client";

const STORAGE_KEY = "athena-study-progress";

export function getProgress(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function setProgress(slug: string, completed: boolean) {
  const progress = getProgress();
  if (completed) {
    progress[slug] = true;
  } else {
    delete progress[slug];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isCompleted(slug: string): boolean {
  return getProgress()[slug] === true;
}

export function getCompletedCount(slugs: string[]): number {
  const progress = getProgress();
  return slugs.filter((slug) => progress[slug]).length;
}
