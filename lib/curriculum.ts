export interface StudyMaterial {
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  difficulty: "입문" | "기본" | "중급" | "심화";
  readingTime: string;
  phase: number;
  phaseTitle: string;
  prerequisites?: string[];
  athenaConnection?: string;
  isNew?: boolean;
}

export interface PhaseInfo {
  phase: number;
  title: string;
  description: string;
}

export const phases: PhaseInfo[] = [
  { phase: 0, title: "개발 기초", description: "프로젝트 시작 전 기반 다지기" },
  { phase: 1, title: "AI/NLP 기초", description: "RAG를 이해하기 위한 기반 지식" },
  { phase: 2, title: "RAG 핵심", description: "ATHENA PROTOv1 이해 + v2 파이프라인 설계" },
  { phase: 3, title: "KG & GraphRAG", description: "ATHENA v2의 핵심 — KG 기반 인과 추론" },
  { phase: 4, title: "Agent & AgentRAG", description: "ATHENA의 최종 진화 방향" },
];

export const studyMaterials: StudyMaterial[] = [
  // ── Phase 0: 개발 기초 ──────────────────────────────────
  {
    slug: "environment-setup",
    title: "환경 세팅 가이드",
    description: "Python 3.11, uv, Jupyter, Ollama 설치 및 설정. 사전 과제를 시작하기 전에 반드시 완료해야 한다.",
    icon: "settings",
    order: 1,
    difficulty: "입문",
    readingTime: "15분",
    phase: 0,
    phaseTitle: "개발 기초",
    athenaConnection: "ATHENA 프로젝트의 개발 환경을 직접 세팅한다.",
  },
  {
    slug: "python-dev-basics",
    title: "Python 실무 기초",
    description: "API 호출, 파일 I/O, JSON 처리, 비동기 기초. 실제 프로젝트에서 매일 쓰는 Python 패턴.",
    icon: "code",
    order: 2,
    difficulty: "입문",
    readingTime: "25분",
    phase: 0,
    phaseTitle: "개발 기초",
    prerequisites: ["environment-setup"],
    athenaConnection: "ATHENA 백엔드에서 API 호출과 파일 처리를 직접 구현한다.",
    isNew: true,
  },
  {
    slug: "git-github",
    title: "Git & GitHub 협업",
    description: "브랜치 전략, PR 워크플로우, 충돌 해결. ATHENA 팀의 실제 협업 규칙과 연동.",
    icon: "git-branch",
    order: 3,
    difficulty: "입문",
    readingTime: "20분",
    phase: 0,
    phaseTitle: "개발 기초",
    prerequisites: ["environment-setup"],
    athenaConnection: "ATHENA의 브랜치 규칙(feature/<설명>, PR 필수)을 직접 따라한다.",
    isNew: true,
  },

  // ── Phase 1: AI/NLP 기초 ────────────────────────────────
  {
    slug: "ai-ml-basics",
    title: "AI/ML 핵심 개념",
    description: "모델, 학습, 추론의 차이. 신경망 기초와 지도/비지도 학습. 수학 없이 직관적으로 이해한다.",
    icon: "cpu",
    order: 4,
    difficulty: "기본",
    readingTime: "25분",
    phase: 1,
    phaseTitle: "AI/NLP 기초",
    prerequisites: ["python-dev-basics"],
    athenaConnection: "ATHENA가 사용하는 LLM이 어떤 원리로 작동하는지 기초를 잡는다.",
    isNew: true,
  },
  {
    slug: "nlp-basics",
    title: "NLP 기초",
    description: "토큰화(BPE, WordPiece), 텍스트 전처리, 어휘 크기 트레이드오프. tiktoken 실습 포함.",
    icon: "message-square",
    order: 5,
    difficulty: "기본",
    readingTime: "20분",
    phase: 1,
    phaseTitle: "AI/NLP 기초",
    prerequisites: ["ai-ml-basics"],
    athenaConnection: "ATHENA의 청킹 파이프라인이 왜 토큰 단위로 동작하는지 이해한다.",
    isNew: true,
  },
  {
    slug: "embedding-concepts",
    title: "임베딩이란?",
    description: "텍스트를 숫자 벡터로 변환하는 원리. 코사인 유사도와 의미 기반 검색이 왜 키워드 매칭보다 강력한지 이해한다.",
    icon: "layers",
    order: 6,
    difficulty: "기본",
    readingTime: "25분",
    phase: 1,
    phaseTitle: "AI/NLP 기초",
    prerequisites: ["nlp-basics"],
    athenaConnection: "ATHENA의 벡터 검색이 임베딩 위에서 어떻게 작동하는지 체감한다.",
  },
  {
    slug: "transformer-llm",
    title: "Transformer & LLM 작동 원리",
    description: "어텐션 메커니즘 직관적 설명, GPT/BERT/LLaMA 계보, 토큰 생성 과정, temperature/top-p.",
    icon: "brain",
    order: 7,
    difficulty: "기본",
    readingTime: "30분",
    phase: 1,
    phaseTitle: "AI/NLP 기초",
    prerequisites: ["embedding-concepts"],
    athenaConnection: "Ollama로 실행하는 LLM이 내부에서 어떻게 답변을 생성하는지 이해한다.",
    isNew: true,
  },

  // ── Phase 2: RAG 핵심 (기존 자료 재배치) ─────────────────
  {
    slug: "vector-db-comparison",
    title: "벡터 DB 비교",
    description: "ChromaDB, FAISS, Qdrant의 장단점 비교. 사전 과제에서 어떤 벡터 DB를 선택할지 판단하는 근거를 만든다.",
    icon: "database",
    order: 8,
    difficulty: "기본",
    readingTime: "15분",
    phase: 2,
    phaseTitle: "RAG 핵심",
    prerequisites: ["embedding-concepts"],
    athenaConnection: "ATHENA PROTOv1이 ChromaDB를 선택한 근거를 이해한다.",
  },
  {
    slug: "llm-options",
    title: "LLM 선택지 정리",
    description: "Ollama 로컬 모델과 클라우드 API(OpenAI, Anthropic)의 비용/품질 비교. ATHENA 예산 규칙에 맞는 모델 선택법.",
    icon: "brain",
    order: 9,
    difficulty: "기본",
    readingTime: "15분",
    phase: 2,
    phaseTitle: "RAG 핵심",
    prerequisites: ["transformer-llm"],
    athenaConnection: "ATHENA의 API 비용 규칙(월 5만원)에 맞는 모델 선택 전략을 세운다.",
  },
  {
    slug: "rag-architecture",
    title: "RAG 아키텍처 해부",
    description: "청킹 → 임베딩 → 저장 → 검색 → 생성, 전체 RAG 파이프라인의 구조와 각 단계의 트레이드오프를 파악한다.",
    icon: "file-text",
    order: 10,
    difficulty: "기본",
    readingTime: "20분",
    phase: 2,
    phaseTitle: "RAG 핵심",
    prerequisites: ["vector-db-comparison", "llm-options"],
    athenaConnection: "ATHENA PROTOv1의 전체 파이프라인을 이해하고, v2에서 개선할 지점을 파악한다.",
  },
  {
    slug: "graphrag-concepts",
    title: "GraphRAG 개념",
    description: "기본 RAG가 실패하는 인과/요약 질문을 지식 그래프로 해결하는 Microsoft GraphRAG의 아키텍처. ATHENA v2의 핵심 기반.",
    icon: "network",
    order: 11,
    difficulty: "심화",
    readingTime: "25분",
    phase: 2,
    phaseTitle: "RAG 핵심",
    prerequisites: ["rag-architecture"],
    athenaConnection: "ATHENA v2가 왜 GraphRAG를 선택했는지, 기본 RAG의 한계를 직접 체감한다.",
  },
];

/** Phase별로 그룹핑된 모듈 반환 */
export function getModulesByPhase(): Map<number, StudyMaterial[]> {
  const grouped = new Map<number, StudyMaterial[]>();
  for (const m of studyMaterials) {
    const list = grouped.get(m.phase) || [];
    list.push(m);
    grouped.set(m.phase, list);
  }
  return grouped;
}
