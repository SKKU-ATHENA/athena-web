export interface StudyMaterial {
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  difficulty: "입문" | "기본" | "심화";
  readingTime: string;
}

export const studyMaterials: StudyMaterial[] = [
  {
    slug: "environment-setup",
    title: "환경 세팅 가이드",
    description: "Python 3.11, uv, Jupyter, Ollama 설치 및 설정. 사전 과제를 시작하기 전에 반드시 완료해야 한다.",
    icon: "settings",
    order: 1,
    difficulty: "입문",
    readingTime: "15분",
  },
  {
    slug: "embedding-concepts",
    title: "임베딩이란?",
    description: "텍스트를 숫자 벡터로 변환하는 원리. 코사인 유사도와 의미 기반 검색이 왜 키워드 매칭보다 강력한지 이해한다.",
    icon: "layers",
    order: 2,
    difficulty: "기본",
    readingTime: "20분",
  },
  {
    slug: "vector-db-comparison",
    title: "벡터 DB 비교",
    description: "ChromaDB, FAISS, Qdrant의 장단점 비교. 사전 과제에서 어떤 벡터 DB를 선택할지 판단하는 근거를 만든다.",
    icon: "database",
    order: 3,
    difficulty: "기본",
    readingTime: "15분",
  },
  {
    slug: "rag-architecture",
    title: "RAG 아키텍처 해부",
    description: "청킹 → 임베딩 → 저장 → 검색 → 생성, 전체 RAG 파이프라인의 구조와 각 단계의 트레이드오프를 파악한다.",
    icon: "file-text",
    order: 4,
    difficulty: "기본",
    readingTime: "20분",
  },
  {
    slug: "llm-options",
    title: "LLM 선택지 정리",
    description: "Ollama 로컬 모델과 클라우드 API(OpenAI, Anthropic)의 비용/품질 비교. ATHENA 예산 규칙에 맞는 모델 선택법.",
    icon: "brain",
    order: 5,
    difficulty: "기본",
    readingTime: "15분",
  },
  {
    slug: "graphrag-concepts",
    title: "GraphRAG 개념",
    description: "기본 RAG가 실패하는 인과/요약 질문을 지식 그래프로 해결하는 Microsoft GraphRAG의 아키텍처. ATHENA v2의 핵심 기반.",
    icon: "network",
    order: 6,
    difficulty: "심화",
    readingTime: "25분",
  },
];
