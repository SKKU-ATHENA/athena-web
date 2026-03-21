import { notFound } from "next/navigation";
import { getPost, getPostSlugs } from "@/lib/posts";
import { SourceBadge } from "@/components/source-badge";
import { YouTubeEmbed } from "@/components/youtube-embed";

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

  return (
    <div className="mx-auto max-w-3xl">
      <div className="animate-fade-up">
        <h1 className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold tracking-[-0.035em] text-transparent">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-2 text-muted-foreground">{post.description}</p>
        )}
      </div>

      {/* Sources */}
      {post.sources && post.sources.length > 0 && (
        <div className="animate-fade-up mt-5 flex flex-wrap gap-2" style={{ animationDelay: "0.04s" }}>
          {post.sources.map((source, i) => (
            <SourceBadge
              key={i}
              type={source.type}
              label={source.label}
              url={source.url}
            />
          ))}
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
    </div>
  );
}
