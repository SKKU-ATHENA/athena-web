import Link from "next/link";
import {
  Scissors,
  Binary,
  Database,
  Search,
  MessageSquare,
  HelpCircle,
  GitCompare,
  ClipboardList,
  ExternalLink,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PenLine,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { YouTubeEmbed } from "@/components/youtube-embed";

const steps = [
  {
    number: 1,
    title: "청킹 (Chunking)",
    icon: Scissors,
    description: "문서를 작은 조각으로 나눈다.",
    experiment: {
      title: "체감 실험",
      items: [
        "문서 전체를 한 덩어리로 검색 → 관련 없는 내용이 딸려옴",
        "한 문장씩 쪼개기 → 맥락 소실",
        "적절한 크기 (200~500자) → 균형점",
      ],
      insight: "청크 크기는 정답이 없고 트레이드오프",
    },
    code: `# 간단한 청킹 예시
def chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

# 실험: 다른 크기로 청킹해보기
for size in [50, 300, 1000]:
    chunks = chunk_text(document, chunk_size=size)
    print(f"chunk_size={size}: {len(chunks)}개 청크")`,
    relatedStudy: "rag-architecture",
  },
  {
    number: 2,
    title: "임베딩 (Embedding)",
    icon: Binary,
    description: "텍스트 조각을 숫자 벡터로 변환한다.",
    experiment: {
      title: "체감 실험",
      items: [
        '"인공지능"과 "AI"의 유사도 → 높음',
        '"인공지능"과 "냉장고"의 유사도 → 낮음',
        "키워드가 완전히 다른데 의미가 비슷한 문장 쌍 테스트",
      ],
      insight: "임베딩은 단어가 아니라 의미를 잡는다",
    },
    code: `from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

texts = ["인공지능", "AI", "냉장고"]
embeddings = model.encode(texts)

# 코사인 유사도 계산
def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

print(f'"인공지능" vs "AI": {cosine_sim(embeddings[0], embeddings[1]):.3f}')
print(f'"인공지능" vs "냉장고": {cosine_sim(embeddings[0], embeddings[2]):.3f}')`,
    relatedStudy: "embedding-concepts",
  },
  {
    number: 3,
    title: "벡터 저장소 (Vector Store)",
    icon: Database,
    description:
      "벡터를 저장하고 유사한 것을 빠르게 찾는다. 도구는 본인이 조사해서 선택하고, 선택 근거를 정리할 것.",
    experiment: {
      title: "자율 조사",
      items: [
        "ChromaDB, FAISS, Qdrant 등 후보 조사",
        "각 도구의 장단점 비교",
        "프로젝트 맥락에 맞는 도구 선택 + 근거 작성",
      ],
      insight: "도구 선택 보고서 (300자 이상) 작성 필수",
    },
    code: `# ChromaDB 예시 (다른 도구를 선택해도 됨)
import chromadb

client = chromadb.Client()
collection = client.create_collection("my_rag")

# 청크와 임베딩을 저장
collection.add(
    documents=chunks,
    ids=[f"chunk_{i}" for i in range(len(chunks))],
)

# 유사도 검색
results = collection.query(
    query_texts=["인공지능의 역사"],
    n_results=5,
)`,
    relatedStudy: "vector-db-comparison",
  },
  {
    number: 4,
    title: "검색 (Retrieval)",
    icon: Search,
    description: "질문을 임베딩하고, 가장 가까운 청크 k개를 가져온다.",
    experiment: {
      title: "체감 실험",
      items: [
        "k=1: 정보 부족, 핵심만 가져옴",
        "k=5: 적절한 양의 컨텍스트",
        "k=20: 노이즈 증가, 답변 품질 저하",
      ],
      insight: "적으면 정보 부족, 많으면 노이즈. 트레이드오프",
    },
    code: `# k값에 따른 검색 결과 비교
question = "딥러닝이 기존 머신러닝과 다른 점은?"

for k in [1, 5, 20]:
    results = collection.query(
        query_texts=[question],
        n_results=k,
    )
    print(f"\\n--- k={k} ---")
    for doc in results["documents"][0]:
        print(f"  {doc[:80]}...")`,
    relatedStudy: "rag-architecture",
  },
  {
    number: 5,
    title: "생성 (Generation)",
    icon: MessageSquare,
    description: "검색된 청크를 LLM에 컨텍스트로 넣고 답변을 생성한다.",
    experiment: {
      title: "체감 실험",
      items: [
        "같은 질문을 컨텍스트 없이 LLM에게 → 환각 또는 일반론",
        "검색 결과와 함께 → 구체적이고 정확한 답변",
      ],
      insight: 'LLM은 "아는 것"이 아니라 "주어진 것"에서 답한다',
    },
    code: `import ollama

question = "트랜스포머 모델의 핵심 혁신은 무엇인가?"
retrieved_chunks = collection.query(query_texts=[question], n_results=5)
context = "\\n\\n".join(retrieved_chunks["documents"][0])

# 컨텍스트 없이
response_no_ctx = ollama.chat(model="llama3", messages=[
    {"role": "user", "content": question}
])

# 컨텍스트와 함께 (RAG)
response_rag = ollama.chat(model="llama3", messages=[
    {"role": "system", "content": f"다음 자료를 참고하여 답변하세요:\\n\\n{context}"},
    {"role": "user", "content": question}
])

print("=== 컨텍스트 없이 ===")
print(response_no_ctx["message"]["content"][:300])
print("\\n=== RAG ===")
print(response_rag["message"]["content"][:300])`,
    relatedStudy: "llm-options",
  },
];

const questionTypes = [
  {
    type: "사실 확인",
    example: '"X는 몇 년에?"',
    result: "잘 됨",
    status: "success" as const,
  },
  {
    type: "비교",
    example: '"A와 B의 차이는?"',
    result: "정보가 두 청크에 걸치면 부실",
    status: "warning" as const,
  },
  {
    type: "인과",
    example: '"왜 X가 Y를 대체했나?"',
    result: "인과 사슬이 분산되어 있으면 못 잡음",
    status: "error" as const,
  },
  {
    type: "전체 요약",
    example: '"주요 흐름은?"',
    result: "top-k만 보니 전체 그림 불가",
    status: "error" as const,
  },
];

const deliverables = [
  { title: "동작하는 RAG", description: "Jupyter Notebook, Colab 실행 가능" },
  { title: "도구 선택 보고서", description: "임베딩 모델 / 벡터 DB / LLM 뭘 골랐고 왜 (300자+)" },
  { title: "질문 테스트 결과표", description: "4가지 유형 × 12개 질문, 내 RAG vs GraphRAG 비교" },
  { title: "RAG vs GraphRAG 비교표", description: "같은 질문에 대한 답변 나란히 비교" },
  { title: "한계 분석 + 개선 시도", description: "기본 RAG 한계, Advanced RAG 기법 1개 이상 시도 (500자+)" },
  { title: "아키텍처 설계", description: "ATHENA용 RAG 아키텍처 다이어그램 + 설명" },
  { title: "전체 회고", description: "사고 과정과 깨달음 에세이 (500자+)" },
];

export default function PreAssignmentPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
            <FlaskConical className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            내 손으로 만드는 RAG
          </h1>
        </div>
        <p className="mt-3 text-lg text-muted-foreground">
          RAG 파이프라인을 직접 조립한 뒤, 같은 데이터에 Microsoft GraphRAG를
          돌려서 비교한다. 각 단계마다 &ldquo;이걸 왜 해야 하는가&rdquo;를
          체감하는 실험이 포함되어 있다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
            Google Colab
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
            비용 0원
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
            Jupyter Notebook
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
            9문제 · 4파트
          </span>
        </div>

        {/* Part Navigation */}
        <nav className="mt-6 flex items-center gap-0 rounded-xl border border-border bg-[var(--forge-surface)] p-1">
          <a href="#part-1" className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
            Part 1: 조립
          </a>
          <div className="h-4 w-px bg-border" />
          <a href="#part-2" className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors">
            Part 2: 한계
          </a>
          <div className="h-4 w-px bg-border" />
          <a href="#part-3" className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors">
            Part 3: 비교
          </a>
          <div className="h-4 w-px bg-border" />
          <a href="#part-4" className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors">
            Part 4: 성찰
          </a>
        </nav>
      </div>

      {/* Prerequisites */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 dark:bg-amber-500/10">
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            시작 전에{" "}
            <Link href="/study/environment-setup" className="font-medium text-primary hover:underline">
              환경 세팅 가이드
            </Link>
            를 완료하세요. Google Colab을 사용하므로 별도 설치는 불필요하지만, 기본 개념을 확인하세요.
          </span>
        </p>
      </div>

      {/* Data Info */}
      <Card className="shadow-[0_22px_70px_-34px_rgba(34,27,20,0.08)] backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">데이터</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            기본 제공: 한국어 텍스트 10~15편 (인공지능 발전사 등). 본인 주제로
            교체 가능하되, <strong>기본 데이터로 먼저 완성</strong>할 것.
          </p>
        </CardContent>
      </Card>

      <Separator className="opacity-50" />

      {/* Part 1: RAG Pipeline */}
      <section id="part-1">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">Part 1: RAG 파이프라인 조립</h2>
        <p className="mb-6 text-muted-foreground">
          가이드 Notebook을 따라가며 파이프라인을 조립한다.
        </p>

        <div className="my-6 overflow-hidden rounded-xl border border-border">
          <img src="/athena-web/diagrams/rag-pipeline.png" alt="RAG Pipeline Architecture" className="w-full" />
        </div>

        <div className="space-y-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.number} id={`step-${step.number}`} className="shadow-[0_22px_70px_-34px_rgba(34,27,20,0.08)] backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                      {step.number}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>{step.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="ml-0 md:ml-12">
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="ml-0 space-y-4 md:ml-12">
                  {/* Experiment */}
                  <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 dark:border-primary/20 dark:bg-primary/10">
                    <h4 className="mb-2 text-sm font-semibold">
                      {step.experiment.title}
                    </h4>
                    <ul className="mb-3 space-y-1">
                      {step.experiment.items.map((item, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground before:mr-2 before:content-['•']"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm font-medium text-primary">
                      깨달음: {step.experiment.insight}
                    </p>
                  </div>

                  {/* Code */}
                  <div className="overflow-x-auto rounded-xl border border-border bg-[var(--forge-surface)] p-5">
                    <pre className="font-mono text-[0.875rem] leading-[1.6] text-foreground">
                      <code>{step.code}</code>
                    </pre>
                  </div>

                  {/* Related Study Link */}
                  {step.relatedStudy && (
                    <Link
                      href={`/study/${step.relatedStudy}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      관련 학습 자료 보기
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 border-primary/20 bg-primary/5 shadow-[0_22px_70px_-34px_rgba(34,27,20,0.08)] dark:border-primary/30 dark:bg-primary/10">
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <p className="font-medium">
                Part 1 완료: 질문 → 검색 → 답변이 동작하는 RAG
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              다음 단계: 만든 RAG에 다양한 유형의 질문을 던져서 한계를 발견한다. ↓
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-50" />

      {/* Part 2: Limitations */}
      <section id="part-2">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
            <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Part 2: 한계 발견</h2>
        </div>
        <p className="mb-6 text-muted-foreground">
          만든 RAG에 4가지 유형의 질문을 던진다.
        </p>

        <div className="overflow-x-auto rounded-xl border border-border bg-[var(--forge-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[var(--forge-surface-raised)]">
                <th className="p-4 text-left font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">유형</th>
                <th className="p-4 text-left font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">예시</th>
                <th className="p-4 text-left font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">예상 결과</th>
              </tr>
            </thead>
            <tbody>
              {questionTypes.map((q, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-4 font-medium">{q.type}</td>
                  <td className="p-4 text-muted-foreground">{q.example}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5">
                      {q.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                      {q.status === "warning" && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      {q.status === "error" && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {q.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Card className="mt-4 shadow-[0_22px_70px_-34px_rgba(34,27,20,0.08)] backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold">정리할 것:</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li className="before:mr-2 before:content-['•']">
                잘 되는 질문 3개
              </li>
              <li className="before:mr-2 before:content-['•']">
                안 되는 질문 3개 + 안 되는 이유 분석
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mt-6 shadow-[0_22px_70px_-34px_rgba(34,27,20,0.08)] backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-sm font-bold text-white">6</div>
              <CardTitle>RAG 개선 아이디어</CardTitle>
            </div>
            <CardDescription className="ml-0 md:ml-12">
              Part 2에서 발견한 한계를 해결할 방법을 제안하고, 하나를 직접 시도한다.
            </CardDescription>
          </CardHeader>
          <CardContent className="ml-0 space-y-4 md:ml-12">
            <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4">
              <h4 className="mb-2 text-sm font-semibold">할 일</h4>
              <ul className="space-y-1">
                <li className="text-sm text-muted-foreground before:mr-2 before:content-['•']">한계를 해결할 방법 3가지 이상 제안</li>
                <li className="text-sm text-muted-foreground before:mr-2 before:content-['•']">각 방법의 예상 효과와 구현 복잡도를 표로 정리</li>
                <li className="text-sm text-muted-foreground before:mr-2 before:content-['•']">Advanced RAG 기법 (쿼리 확장, Reranking, HyDE) 중 1개 직접 시도</li>
              </ul>
              <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-400">산출물: 한계 분석 + 개선 시도 보고서 (500자+)</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-50" />

      {/* Part 3: GraphRAG Comparison */}
      <section id="part-3">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20">
            <GitCompare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Part 3: GraphRAG 비교</h2>
        </div>
        <p className="mb-6 text-muted-foreground">
          같은 데이터에 Microsoft GraphRAG를 돌린다 (팀 1회 공동 실행, 결과
          공유).
        </p>

        <div className="mb-6 overflow-hidden rounded-xl border border-border">
          <img src="/athena-web/diagrams/graphrag-compare.png" alt="GraphRAG vs Basic RAG" className="w-full" />
        </div>

        <div className="space-y-4">
          <Card className="shadow-[0_22px_70px_-34px_rgba(34,27,20,0.08)] backdrop-blur-sm">
            <CardContent className="space-y-3 pt-6">
              {[
                "Part 2에서 실패했던 질문을 GraphRAG에 던지기",
                "내 RAG vs GraphRAG 답변을 나란히 비교",
                "GraphRAG가 뭘 다르게 했길래 답변이 달라졌는지 분석",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400">
                    {i + 1}
                  </span>
                  <p className="text-sm">{text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <a
              href="https://github.com/microsoft/graphrag"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 transition-opacity hover:opacity-80"
            >
              GitHub — microsoft/graphrag (25k+ stars)
            </a>
            <a
              href="https://arxiv.org/abs/2404.16130"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400 transition-opacity hover:opacity-80"
            >
              논문 — From Local to Global (arXiv 2024)
            </a>
          </div>

          <Link
            href="/study/graphrag-concepts"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            GraphRAG 개념 학습 자료 보기
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <Card className="mt-6 shadow-[0_22px_70px_-34px_rgba(34,27,20,0.08)] backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500 text-sm font-bold text-white">8</div>
              <CardTitle>ATHENA를 위한 RAG 아키텍처 설계</CardTitle>
            </div>
            <CardDescription className="ml-0 md:ml-12">
              ATHENA 프로젝트의 요구사항에 맞는 RAG 아키텍처를 설계한다.
            </CardDescription>
          </CardHeader>
          <CardContent className="ml-0 space-y-4 md:ml-12">
            <div className="rounded-xl border border-purple-500/10 bg-purple-500/5 p-4">
              <h4 className="mb-2 text-sm font-semibold">할 일</h4>
              <ul className="space-y-1">
                <li className="text-sm text-muted-foreground before:mr-2 before:content-['•']">ATHENA 핵심 요구사항 정리 (의사결정 근거 검색, 인과 사슬 응답)</li>
                <li className="text-sm text-muted-foreground before:mr-2 before:content-['•']">기본 RAG / Advanced RAG / GraphRAG 중 적합한 접근법 판단 + 근거</li>
                <li className="text-sm text-muted-foreground before:mr-2 before:content-['•']">간단한 아키텍처 다이어그램 작성</li>
              </ul>
              <p className="mt-3 text-sm font-medium text-purple-700 dark:text-purple-400">산출물: 아키텍처 설계 문서 + 다이어그램</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <img src="/athena-web/diagrams/athena-v2.png" alt="ATHENA v2 Architecture" className="w-full" />
              <p className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground">참고: ATHENA v2 목표 아키텍처 (LangGraph StateGraph)</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-50" />

      {/* Recommended YouTube */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">참고 영상</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">RAG 개념 설명</p>
            <YouTubeEmbed videoId="T-D1OfcDW1M" title="RAG Explained" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Microsoft GraphRAG 소개</p>
            <YouTubeEmbed
              videoId="r09tJfON6kE"
              title="GraphRAG: LLM-Derived Knowledge Graphs"
            />
          </div>
        </div>
      </section>

      <Separator className="opacity-50" />

      {/* Part 4: Self-Reflection */}
      <section id="part-4">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <PenLine className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Part 4: 자기 성찰</h2>
        </div>
        <p className="mb-6 text-muted-foreground">전체 과정을 돌아보고 배운 것을 정리한다.</p>

        <Card className="shadow-[0_22px_70px_-34px_rgba(34,27,20,0.08)] backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-sm font-bold text-white">9</div>
              <CardTitle>전체 회고</CardTitle>
            </div>
            <CardDescription className="ml-0 md:ml-12">
              이 과제에서의 경험을 구체적 예시와 함께 돌아본다. (500자 이상)
            </CardDescription>
          </CardHeader>
          <CardContent className="ml-0 space-y-4 md:ml-12">
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
              <h4 className="mb-2 text-sm font-semibold">필수 항목</h4>
              <ul className="space-y-1">
                <li className="text-sm text-muted-foreground before:mr-2 before:content-['•']">가장 어려웠던 점과 해결 과정</li>
                <li className="text-sm text-muted-foreground before:mr-2 before:content-['•']">가장 큰 깨달음 (구체적 예시와 함께)</li>
                <li className="text-sm text-muted-foreground before:mr-2 before:content-['•']">다시 한다면 뭘 다르게 할 것인가</li>
                <li className="text-sm text-muted-foreground before:mr-2 before:content-['•']">ATHENA 프로젝트에서 내가 기여할 수 있는 부분</li>
              </ul>
              <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                &ldquo;잘했다/어려웠다&rdquo;가 아니라 구체적 사고 과정을 기술할 것
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-50" />

      {/* Deliverables */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <ClipboardList className="h-5 w-5 text-foreground" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">산출물</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {deliverables.map((d, i) => (
            <Card key={i} className="shadow-[0_22px_70px_-34px_rgba(34,27,20,0.08)] backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{d.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{d.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
