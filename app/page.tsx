import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">ATHENA</h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          AI 기반 지식 관리 시스템 — 학습 정리
        </p>
      </header>

      <main>
        {posts.length === 0 ? (
          <p className="text-zinc-500">아직 작성된 글이 없습니다.</p>
        ) : (
          <ul className="space-y-8">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="group block"
                >
                  <h2 className="text-xl font-semibold group-hover:underline">
                    {post.title}
                  </h2>
                  {post.description && (
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {post.description}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
                    {post.date} · {post.author}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
