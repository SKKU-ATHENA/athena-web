import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">팀 블로그</h1>
        <p className="mt-2 text-muted-foreground">
          ATHENA 팀원들의 학습 기록과 공유 글
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center">
          <p className="text-muted-foreground">아직 작성된 글이 없습니다.</p>
          <p className="text-sm text-muted-foreground mt-1">
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              content/
            </code>{" "}
            디렉토리에 Markdown 파일을 추가하세요.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`} className="block group">
              <Card className="transition-shadow group-hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg group-hover:underline underline-offset-2">
                    {post.title}
                  </CardTitle>
                  {post.description && (
                    <CardDescription>{post.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">
                      {post.author}
                    </Badge>
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
