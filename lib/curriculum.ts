export interface StudyMaterial {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export const studyMaterials: StudyMaterial[] = [
  {
    slug: "environment-setup",
    title: "환경 세팅 가이드",
    description: "Python 3.11, uv, Jupyter, Ollama 설치 및 설정",
    icon: "settings",
  },
  {
    slug: "embedding-concepts",
    title: "임베딩이란?",
    description: "벡터 공간, 코사인 유사도, 의미 기반 검색의 원리",
    icon: "layers",
  },
  {
    slug: "vector-db-comparison",
    title: "벡터 DB 비교",
    description: "ChromaDB, FAISS, Qdrant 등 특성과 트레이드오프",
    icon: "database",
  },
  {
    slug: "rag-architecture",
    title: "RAG 아키텍처 해부",
    description: "전체 RAG 파이프라인 개념도와 각 단계의 역할",
    icon: "file-text",
  },
  {
    slug: "llm-options",
    title: "LLM 선택지 정리",
    description: "클라우드 vs 로컬, 비용, 품질 트레이드오프",
    icon: "brain",
  },
  {
    slug: "graphrag-concepts",
    title: "GraphRAG 개념",
    description: "Microsoft GraphRAG 아키텍처, 엔티티 추출, 커뮤니티 탐지",
    icon: "network",
  },
];
