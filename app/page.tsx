import Link from "next/link";
import {
  curriculum,
  getTrackColor,
  getTrackBgColor,
} from "@/lib/curriculum";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrackProgress } from "@/components/track-progress";

export default function Home() {
  const totalItems = curriculum.reduce(
    (sum, t) => sum + t.sections.reduce((s, sec) => s + sec.items.length, 0),
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ATHENA 학습 정리
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          AI 기반 지식 관리 시스템 — 의사결정 근거를 Knowledge Graph로 구조화하여
          &ldquo;왜?&rdquo; 질문에 인과 사슬로 응답하는 시스템
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">Python 3.11</Badge>
          <Badge variant="outline">Neo4j</Badge>
          <Badge variant="outline">LLM</Badge>
          <Badge variant="outline">Knowledge Graph</Badge>
          <Badge variant="outline">RAG</Badge>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-8 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">전체 진행률</span>
          <span className="text-xs text-muted-foreground">
            총 {totalItems}개 학습 항목
          </span>
        </div>
        <TrackProgress />
      </div>

      {/* Track cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {curriculum.map((track) => {
          const itemCount = track.sections.reduce(
            (s, sec) => s + sec.items.length,
            0
          );
          return (
            <Card
              key={track.id}
              id={track.id}
              className={`border ${getTrackBgColor(track.color)} transition-shadow hover:shadow-md`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle
                    className={`text-lg ${getTrackColor(track.color)}`}
                  >
                    {track.title}
                  </CardTitle>
                  {track.weeks > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {track.weeks}주
                    </Badge>
                  )}
                </div>
                <CardDescription>{track.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {track.sections.map((section) => (
                    <li key={section.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{section.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {section.items.length}항목
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.slug}
                            href={`/study/${item.slug}`}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-xs text-muted-foreground">
                  {itemCount}개 항목
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
