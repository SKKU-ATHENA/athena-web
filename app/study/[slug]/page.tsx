import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPost, getPostSlugs } from "@/lib/posts";
import { studyMaterials } from "@/lib/curriculum";
import { SourceBadge } from "@/components/source-badge";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { StudyCompletion } from "@/components/study-completion";

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function StudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  // Find prev/next
  const currentIndex = studyMaterials.findIndex((m) => m.slug === slug);
  const prev = currentIndex > 0 ? studyMaterials[currentIndex - 1] : null;
  const next = currentIndex < studyMaterials.length - 1 ? studyMaterials[currentIndex + 1] : null;
  const current = studyMaterials[currentIndex];

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* 학습 진행도 바 */}
      <div className="mb-6 animate-fade-up">
        <div className="mb-2 flex items-center justify-between text-[0.65rem] text-muted-foreground">
          <span>{currentIndex + 1} / {studyMaterials.length}</span>
          <div className="flex gap-1">
            {studyMaterials.map((m, idx) => (
              <Link
                key={m.slug}
                href={`/study/${m.slug}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? "w-6 bg-primary" : idx < currentIndex ? "w-3 bg-primary/40" : "w-3 bg-muted"
                }`}
                title={m.title}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="animate-fade-up">
        {current && (
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/15 font-mono text-xs font-bold text-primary">
              {current.order}
            </span>
            <span className={`rounded-full px-2 py-0.5 font-mono text-[0.65rem] font-medium ${
              current.difficulty === "입문" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
              current.difficulty === "심화" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
              "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            }`}>
              {current.difficulty}
            </span>
            <span className="text-xs text-muted-foreground">{current.readingTime}</span>
          </div>
        )}

        <h1 className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-[-0.035em] text-transparent">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-2 text-muted-foreground">{post.description}</p>
        )}
      </div>

      {/* Sources card */}
      {post.sources && post.sources.length > 0 && (
        <div className="animate-fade-up mt-5 rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-4" style={{ animationDelay: "0.04s" }}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">참고 자료</h3>
          <div className="flex flex-wrap gap-2">
            {post.sources.map((source, i) => (
              <SourceBadge
                key={i}
                type={source.type}
                label={source.label}
                url={source.url}
              />
            ))}
          </div>
        </div>
      )}

      {/* YouTube */}
      {post.youtube && post.youtube.length > 0 && (
        <div className="animate-fade-up mt-8 space-y-4" style={{ animationDelay: "0.08s" }}>
          {post.youtube.map((videoId, i) => (
            <YouTubeEmbed key={i} videoId={videoId} />
          ))}
        </div>
      )}

      {/* Content */}
      <article
        className="prose prose-neutral dark:prose-invert animate-fade-up mt-10 max-w-none"
        style={{ animationDelay: "0.12s" }}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* Completion + Navigation */}
      <div className="animate-fade-up mt-12 space-y-6" style={{ animationDelay: "0.16s" }}>
        {/* Completion button */}
        <div className="flex justify-center">
          <StudyCompletion slug={slug} />
        </div>

        {/* Prev / Next */}
        <div className="flex items-stretch gap-3">
          {prev ? (
            <Link
              href={`/study/${prev.slug}`}
              className="flex flex-1 items-center gap-3 rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-4 transition-all duration-200 hover:border-[var(--forge-border)]"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <div className="text-[0.65rem] text-muted-foreground">이전</div>
                <div className="text-sm font-semibold">{prev.title}</div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <Link
              href={`/study/${next.slug}`}
              className="flex flex-1 items-center justify-end gap-3 rounded-xl border border-[var(--forge-border-subtle)] bg-[var(--forge-surface)] p-4 text-right transition-all duration-200 hover:border-[var(--forge-border)]"
            >
              <div>
                <div className="text-[0.65rem] text-muted-foreground">다음</div>
                <div className="text-sm font-semibold">{next.title}</div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}
