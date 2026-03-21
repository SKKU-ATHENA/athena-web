import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllStudyItems,
  findStudyItem,
  getTrackColor,
} from "@/lib/curriculum";
import { getPost, getAllPosts } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StudyCheck } from "@/components/study-check";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export function generateStaticParams() {
  return getAllStudyItems().map((item) => ({ slug: item.slug }));
}

export default async function StudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = findStudyItem(slug);
  if (!found) notFound();

  const { track, section, item } = found;

  // Try to load markdown content if available
  const allPosts = getAllPosts();
  const hasContent = allPosts.some((p) => p.slug === slug);
  let contentHtml = "";
  if (hasContent) {
    const post = await getPost(slug);
    contentHtml = post.contentHtml;
  }

  // Find prev/next items for navigation
  const allItems = getAllStudyItems();
  const idx = allItems.findIndex((i) => i.slug === slug);
  const prev = idx > 0 ? allItems[idx - 1] : null;
  const next = idx < allItems.length - 1 ? allItems[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className={getTrackColor(track.color)}
          >
            {track.title}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {section.title}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
        {item.description && (
          <p className="mt-2 text-muted-foreground">{item.description}</p>
        )}
      </div>

      <Separator className="mb-8" />

      {/* Content */}
      {contentHtml ? (
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center">
          <p className="text-muted-foreground mb-2">
            아직 작성된 내용이 없습니다.
          </p>
          <p className="text-sm text-muted-foreground">
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              content/{slug}.md
            </code>{" "}
            파일을 생성하여 내용을 추가하세요.
          </p>
        </div>
      )}

      {/* Completion checkbox */}
      <div className="mt-10 flex justify-center">
        <StudyCheck slug={slug} />
      </div>

      {/* Prev/Next navigation */}
      <Separator className="my-8" />
      <nav className="flex items-center justify-between">
        {prev ? (
          <Button variant="ghost" render={<Link href={`/study/${prev.slug}`} />} className="gap-1">
            <ChevronLeftIcon className="size-4" />
            <span className="max-w-[150px] truncate">{prev.title}</span>
          </Button>
        ) : (
          <div />
        )}
        {next ? (
          <Button variant="ghost" render={<Link href={`/study/${next.slug}`} />} className="gap-1">
            <span className="max-w-[150px] truncate">{next.title}</span>
            <ChevronRightIcon className="size-4" />
          </Button>
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}
