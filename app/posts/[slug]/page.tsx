import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/posts";

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
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
      >
        &larr; 목록으로
      </Link>

      <article className="mt-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
            {post.date} · {post.author}
          </p>
        </header>

        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </div>
  );
}
