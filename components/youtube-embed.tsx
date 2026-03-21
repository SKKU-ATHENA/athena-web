export function YouTubeEmbed({
  videoId,
  title,
}: {
  videoId: string;
  title?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[var(--forge-surface)] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      <div className="relative aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title ?? "YouTube 영상"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
