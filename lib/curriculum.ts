export interface StudyItem {
  slug: string;
  title: string;
  description?: string;
}

export interface StudySection {
  id: string;
  title: string;
  icon: string;
  items: StudyItem[];
}

export interface StudyTrack {
  id: string;
  title: string;
  description: string;
  color: string;
  weeks: number;
  sections: StudySection[];
}

export const curriculum: StudyTrack[] = [
  {
    id: "foundations",
    title: "기초 다지기",
    description: "AI/ML 기본 개념과 개발 환경",
    color: "orange",
    weeks: 4,
    sections: [
      {
        id: "env-setup",
        title: "Week 1 — 개발 환경",
        icon: "terminal",
        items: [
          {
            slug: "python-uv-setup",
            title: "Python + uv 환경 세팅",
            description: "Python 3.11과 uv 패키지 매니저 설치 및 설정",
          },
          {
            slug: "git-workflow",
            title: "Git 워크플로우",
            description: "브랜치 전략, 커밋 컨벤션, PR 규칙",
          },
          {
            slug: "vscode-config",
            title: "VS Code 설정",
            description: "추천 익스텐션과 디버깅 환경 구성",
          },
        ],
      },
      {
        id: "ai-basics",
        title: "Week 2 — AI/ML 기초",
        icon: "brain",
        items: [
          {
            slug: "ml-fundamentals",
            title: "머신러닝 기본 개념",
            description: "지도/비지도 학습, 모델 평가 메트릭",
          },
          {
            slug: "nlp-intro",
            title: "NLP 입문",
            description: "토크나이제이션, 임베딩, 어텐션 메커니즘",
          },
          {
            slug: "transformer-architecture",
            title: "Transformer 아키텍처",
            description: "Self-attention, Multi-head attention, 위치 인코딩",
          },
        ],
      },
      {
        id: "llm-basics",
        title: "Week 3-4 — LLM 기초",
        icon: "sparkles",
        items: [
          {
            slug: "llm-overview",
            title: "LLM 개요",
            description: "GPT, Claude, Llama 등 주요 모델 비교",
          },
          {
            slug: "prompt-engineering",
            title: "프롬프트 엔지니어링",
            description: "Few-shot, CoT, 구조화된 출력 등 핵심 기법",
          },
          {
            slug: "ollama-local",
            title: "Ollama로 로컬 LLM 실행",
            description: "로컬 환경에서 LLM 구동 및 API 활용",
          },
          {
            slug: "api-usage",
            title: "OpenAI / Anthropic API",
            description: "API 호출, 토큰 관리, 비용 최적화",
          },
        ],
      },
    ],
  },
  {
    id: "core-tech",
    title: "핵심 기술",
    description: "Knowledge Graph와 임베딩 파이프라인",
    color: "blue",
    weeks: 5,
    sections: [
      {
        id: "knowledge-graph",
        title: "Week 5-6 — Knowledge Graph",
        icon: "network",
        items: [
          {
            slug: "graph-theory",
            title: "그래프 이론 기초",
            description: "노드, 엣지, 속성 그래프 모델",
          },
          {
            slug: "neo4j-setup",
            title: "Neo4j 설치와 Cypher",
            description: "Neo4j 환경 구축 및 Cypher 쿼리 언어",
          },
          {
            slug: "kg-modeling",
            title: "지식 그래프 모델링",
            description: "온톨로지 설계, 관계 정의, 스키마 패턴",
          },
          {
            slug: "kg-from-text",
            title: "텍스트에서 KG 추출",
            description: "LLM을 활용한 엔티티/관계 추출 파이프라인",
          },
        ],
      },
      {
        id: "embedding",
        title: "Week 7-8 — 임베딩 & 벡터",
        icon: "layers",
        items: [
          {
            slug: "embedding-basics",
            title: "임베딩 기초",
            description: "Word2Vec, 문장 임베딩, 의미적 유사도",
          },
          {
            slug: "vector-search",
            title: "벡터 검색",
            description: "FAISS, 유사도 메트릭, ANN 알고리즘",
          },
          {
            slug: "hybrid-retrieval",
            title: "하이브리드 검색",
            description: "키워드 + 벡터 + 그래프 결합 전략",
          },
        ],
      },
      {
        id: "rag-pipeline",
        title: "Week 9 — RAG 파이프라인",
        icon: "workflow",
        items: [
          {
            slug: "rag-overview",
            title: "RAG 아키텍처",
            description: "Retrieval-Augmented Generation 전체 흐름",
          },
          {
            slug: "chunking-strategies",
            title: "청킹 전략",
            description: "문서 분할, 오버랩, 계층적 청킹",
          },
          {
            slug: "graph-rag",
            title: "Graph RAG",
            description: "지식 그래프 기반 RAG 구현",
          },
        ],
      },
    ],
  },
  {
    id: "system",
    title: "시스템 구축",
    description: "아키텍처 설계와 프론트엔드",
    color: "green",
    weeks: 4,
    sections: [
      {
        id: "architecture",
        title: "Week 10-11 — 시스템 아키텍처",
        icon: "blocks",
        items: [
          {
            slug: "system-design",
            title: "전체 시스템 설계",
            description: "ATHENA v2 아키텍처, 모듈 구성, 데이터 흐름",
          },
          {
            slug: "api-design",
            title: "API 설계",
            description: "RESTful API, 에러 핸들링, 인증",
          },
          {
            slug: "testing-strategy",
            title: "테스트 전략",
            description: "유닛/통합/E2E 테스트, 평가 메트릭",
          },
        ],
      },
      {
        id: "frontend",
        title: "Week 12-13 — 프론트엔드",
        icon: "layout",
        items: [
          {
            slug: "nextjs-basics",
            title: "Next.js 기초",
            description: "App Router, 서버/클라이언트 컴포넌트",
          },
          {
            slug: "chat-ui",
            title: "채팅 UI 구현",
            description: "실시간 스트리밍, 마크다운 렌더링",
          },
          {
            slug: "graph-visualization",
            title: "그래프 시각화",
            description: "D3.js / Cytoscape로 KG 시각화",
          },
        ],
      },
    ],
  },
  {
    id: "reference",
    title: "참고 자료",
    description: "치트시트와 트러블슈팅 가이드",
    color: "purple",
    weeks: 0,
    sections: [
      {
        id: "cheatsheets",
        title: "치트시트",
        icon: "file-text",
        items: [
          {
            slug: "python-cheatsheet",
            title: "Python 치트시트",
            description: "자주 쓰는 패턴과 표준 라이브러리",
          },
          {
            slug: "cypher-cheatsheet",
            title: "Cypher 치트시트",
            description: "Neo4j 쿼리 패턴 모음",
          },
          {
            slug: "git-cheatsheet",
            title: "Git 치트시트",
            description: "일상적인 Git 명령어 정리",
          },
        ],
      },
      {
        id: "troubleshooting",
        title: "트러블슈팅",
        icon: "bug",
        items: [
          {
            slug: "common-errors",
            title: "자주 만나는 에러",
            description: "개발 중 흔히 발생하는 에러와 해결법",
          },
          {
            slug: "performance-tips",
            title: "성능 최적화 팁",
            description: "LLM 응답 속도, 그래프 쿼리 최적화",
          },
        ],
      },
    ],
  },
];

export function getAllStudyItems(): (StudyItem & {
  trackId: string;
  sectionId: string;
})[] {
  return curriculum.flatMap((track) =>
    track.sections.flatMap((section) =>
      section.items.map((item) => ({
        ...item,
        trackId: track.id,
        sectionId: section.id,
      }))
    )
  );
}

export function findStudyItem(slug: string) {
  for (const track of curriculum) {
    for (const section of track.sections) {
      const item = section.items.find((i) => i.slug === slug);
      if (item) return { track, section, item };
    }
  }
  return null;
}

export function getTrackColor(color: string) {
  const colors: Record<string, string> = {
    orange: "text-orange-500",
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
  };
  return colors[color] ?? "text-foreground";
}

export function getTrackBgColor(color: string) {
  const colors: Record<string, string> = {
    orange: "bg-orange-500/10 border-orange-500/20",
    blue: "bg-blue-500/10 border-blue-500/20",
    green: "bg-green-500/10 border-green-500/20",
    purple: "bg-purple-500/10 border-purple-500/20",
  };
  return colors[color] ?? "bg-muted";
}
