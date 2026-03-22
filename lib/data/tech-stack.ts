export interface TechItem {
  name: string;
  category: "backend" | "frontend" | "database" | "ai-ml" | "infra";
  version?: string;
  reason: string;
  icon: string; // emoji or lucide icon name
}

export const techStack: TechItem[] = [
  // Backend
  { name: "Python", category: "backend", version: "3.11", reason: "AI/ML 생태계 최강 + 팀원 전원 숙련", icon: "🐍" },
  { name: "uv", category: "backend", reason: "pip 호환 고속 패키지 매니저", icon: "📦" },

  // Frontend
  { name: "Next.js", category: "frontend", version: "15.3", reason: "정적 생성 + React 생태계 + GitHub Pages", icon: "▲" },
  { name: "Tailwind CSS", category: "frontend", version: "4", reason: "유틸리티 우선 CSS + FORGE 테마 시스템", icon: "🎨" },
  { name: "shadcn/ui", category: "frontend", reason: "Radix UI 기반 접근성 우선 컴포넌트", icon: "🧩" },
  { name: "TypeScript", category: "frontend", version: "5", reason: "타입 안전성 + IDE 지원", icon: "📘" },

  // Database
  { name: "Neo4j", category: "database", reason: "그래프 네이티브 + Cypher + 벡터 인덱스 내장", icon: "🕸️" },

  // AI/ML
  { name: "Ollama", category: "ai-ml", reason: "로컬 LLM 실행 (개발용, 비용 0원)", icon: "🦙" },
  { name: "OpenAI API", category: "ai-ml", reason: "GPT-4o + text-embedding-3-small (프로덕션/평가)", icon: "🤖" },
  { name: "LangChain", category: "ai-ml", reason: "RAG 파이프라인 추상화 + 체이닝", icon: "🔗" },

  // Infrastructure
  { name: "GitHub Pages", category: "infra", reason: "무료 정적 호스팅 + CI 통합", icon: "📄" },
  { name: "Notion", category: "infra", reason: "팀 문서 관리 + M2 연동 예정", icon: "📝" },
  { name: "GitHub", category: "infra", reason: "코드 관리 + PR 기반 협업", icon: "🐙" },
];

export const categoryLabels: Record<TechItem["category"], string> = {
  backend: "Backend",
  frontend: "Frontend",
  database: "Database",
  "ai-ml": "AI / ML",
  infra: "Infrastructure",
};

export const pipelineSteps = [
  {
    id: "ingest",
    label: "원본 문서",
    description: "Notion, PDF, 웹 페이지 등 비정형 문서를 수집합니다.",
    color: "var(--chart-2)",
    tech: ["Notion API", "Python"],
    detail: "다양한 소스에서 문서를 수집하고 통일된 형식으로 변환합니다.",
    relatedStudy: "environment-setup",
  },
  {
    id: "process",
    label: "청킹 + 임베딩",
    description: "문서를 의미 단위로 분할하고 벡터로 변환합니다.",
    color: "var(--chart-3)",
    tech: ["LangChain", "text-embedding-3-small"],
    detail: "청크 크기(500~1000 토큰)와 오버랩(100 토큰)으로 문맥 보존. 임베딩 차원: 1536.",
    relatedStudy: "embedding-concepts",
  },
  {
    id: "graph",
    label: "KG 구축",
    description: "엔티티를 추출하고 관계를 그래프로 저장합니다.",
    color: "var(--chart-1)",
    tech: ["Neo4j", "APOC", "LLM"],
    detail: "LLM으로 엔티티/관계 추출 → Neo4j에 노드/엣지 저장 → 커뮤니티 탐지(Louvain).",
    relatedStudy: "graphrag-concepts",
  },
  {
    id: "respond",
    label: "GraphRAG 응답",
    description: "인과 사슬을 추적하여 '왜?' 질문에 답변합니다.",
    color: "var(--chart-4)",
    tech: ["GraphRAG", "GPT-4o"],
    detail: "질문 분석 → 관련 커뮤니티 식별 → 다단계 관계 탐색 → 인과 사슬 합성 → 답변 생성.",
    relatedStudy: "rag-architecture",
  },
];
