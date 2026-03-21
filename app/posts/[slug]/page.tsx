import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeftIcon } from "lucide-react";

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Button variant="ghost" render={<Link href="/posts" />} className="mb-6 -ml-2 gap-1">
        <ChevronLeftIcon className="size-4" />
        목록으로
      </Button>

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {post.author}
            </Badge>
            <span>{post.date}</span>
          </div>
        </header>

        <Separator className="mb-8" />

        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </div>
  );
}
