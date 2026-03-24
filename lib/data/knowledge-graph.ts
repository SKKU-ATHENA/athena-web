export interface KGNode {
  id: string;
  label: string;
  group: "architecture" | "technology" | "concept" | "decision";
  description: string;
  relatedStudy?: string; // slug for /study link
}

export interface KGLink {
  source: string;
  target: string;
  type: "uses" | "depends_on" | "evolves_to" | "compares" | "replaces" | "enables" | "part_of";
  label: string;
}

export interface KnowledgeGraphData {
  nodes: KGNode[];
  links: KGLink[];
}

const groupColors: Record<KGNode["group"], string> = {
  architecture: "var(--chart-1)",   // Amber
  technology: "var(--chart-2)",     // Warm brown
  concept: "var(--chart-3)",        // Gold
  decision: "var(--chart-4)",       // Dark amber
};

export { groupColors };

export const knowledgeGraphData: KnowledgeGraphData = {
  nodes: [
    // Architecture (핵심 아키텍처)
    { id: "rag", label: "RAG", group: "architecture", description: "Retrieval-Augmented Generation. 외부 문서에서 관련 정보를 검색한 뒤 LLM에 전달하여 답변 생성.", relatedStudy: "rag-architecture" },
    { id: "graphrag", label: "GraphRAG", group: "architecture", description: "Microsoft의 Graph-based RAG. Knowledge Graph 구조를 활용하여 다단계 추론과 인과관계 질문에 답변.", relatedStudy: "graphrag-concepts" },
    { id: "athena", label: "ATHENA", group: "architecture", description: "의사결정 근거를 Knowledge Graph로 구조화하여 '왜?' 질문에 인과 사슬로 응답하는 시스템." },
    { id: "pipeline", label: "데이터 파이프라인", group: "architecture", description: "원본 문서 → 청킹 → 임베딩 → KG 구축 → GraphRAG 응답의 전체 흐름." },

    // Technology (기술 스택)
    { id: "neo4j", label: "Neo4j", group: "technology", description: "그래프 데이터베이스. 노드와 관계를 네이티브로 저장하며 Cypher 쿼리로 다단계 관계 탐색 가능.", relatedStudy: "graphrag-concepts" },
    { id: "python", label: "Python 3.11", group: "technology", description: "ATHENA 백엔드 언어. 풍부한 AI/ML 생태계와 Neo4j 드라이버 지원.", relatedStudy: "python-dev-basics" },
    { id: "ollama", label: "Ollama", group: "technology", description: "로컬 LLM 실행 환경. 개발 중 API 비용 절감을 위해 사용.", relatedStudy: "llm-options" },
    { id: "openai", label: "OpenAI API", group: "technology", description: "GPT-4o, text-embedding-3-small 등. 프로덕션/평가 시 사용.", relatedStudy: "llm-options" },
    { id: "nextjs", label: "Next.js", group: "technology", description: "학습 웹사이트 프레임워크. 정적 생성(SSG)으로 GitHub Pages 배포." },
    { id: "chromadb", label: "ChromaDB", group: "technology", description: "오픈소스 벡터 데이터베이스. RAG 프로토타입에서 빠른 실험용.", relatedStudy: "vector-db-comparison" },
    { id: "faiss", label: "FAISS", group: "technology", description: "Facebook의 벡터 유사도 검색 라이브러리. 대규모 벡터 검색에 최적화.", relatedStudy: "vector-db-comparison" },
    { id: "notion", label: "Notion", group: "technology", description: "팀 문서 관리 + 지식 소스. M2에서 ATHENA와 연동 예정." },

    // Concepts (핵심 개념)
    { id: "embedding", label: "임베딩", group: "concept", description: "텍스트를 고차원 벡터로 변환하여 의미적 유사도를 계산할 수 있게 하는 기술.", relatedStudy: "embedding-concepts" },
    { id: "chunking", label: "청킹", group: "concept", description: "긴 문서를 의미 단위로 분할하는 과정. 청크 크기가 검색 품질에 직접 영향.", relatedStudy: "rag-architecture" },
    { id: "vector-search", label: "벡터 검색", group: "concept", description: "코사인 유사도 기반으로 쿼리와 가장 관련 있는 문서 조각을 찾는 과정.", relatedStudy: "vector-db-comparison" },
    { id: "knowledge-graph", label: "Knowledge Graph", group: "concept", description: "엔티티(노드)와 관계(엣지)로 지식을 구조화한 그래프. 인과 관계와 다단계 추론 가능.", relatedStudy: "graphrag-concepts" },
    { id: "community-detection", label: "커뮤니티 탐지", group: "concept", description: "그래프에서 밀접하게 연결된 노드 그룹을 자동으로 발견하는 알고리즘.", relatedStudy: "graphrag-concepts" },
    { id: "entity-extraction", label: "엔티티 추출", group: "concept", description: "비정형 텍스트에서 사람, 기술, 개념 등 주요 엔티티를 자동으로 식별.", relatedStudy: "graphrag-concepts" },
    { id: "cosine-similarity", label: "코사인 유사도", group: "concept", description: "두 벡터 간의 각도를 측정하여 의미적 유사도를 0~1로 표현.", relatedStudy: "embedding-concepts" },
    { id: "prompt-engineering", label: "프롬프트 엔지니어링", group: "concept", description: "LLM에 효과적인 질문을 구성하는 기법. 컨텍스트 + 지시 + 예시 조합.", relatedStudy: "rag-architecture" },

    // Curriculum (커리큘럼 전용 토픽)
    { id: "ai-ml-basics", label: "AI/ML 기초", group: "concept", description: "모델, 학습, 추론의 기본 개념. LLM이 왜 작동하는지 이해하기 위한 기반.", relatedStudy: "ai-ml-basics" },
    { id: "nlp-basics", label: "NLP 기초", group: "concept", description: "토큰화, 텍스트 전처리 등 자연어를 컴퓨터가 처리하는 방법.", relatedStudy: "nlp-basics" },
    { id: "transformer", label: "Transformer", group: "concept", description: "어텐션 메커니즘 기반의 딥러닝 아키텍처. GPT, BERT, LLaMA의 기반 기술.", relatedStudy: "transformer-llm" },

    // Decisions (의사결정)
    { id: "why-neo4j", label: "왜 Neo4j?", group: "decision", description: "의사결정 인과 사슬의 자연스러운 표현 + Cypher 쿼리 + 벡터 인덱스 내장. 대안: PostgreSQL+pgvector, ArangoDB." },
    { id: "why-python", label: "왜 Python?", group: "decision", description: "AI/ML 생태계 최강 + Neo4j 공식 드라이버 + 팀원 전원 사용 가능. 대안: TypeScript, Go." },
    { id: "why-graphrag", label: "왜 GraphRAG?", group: "decision", description: "기본 RAG의 인과관계 질문 한계 극복. 커뮤니티 요약으로 전체 맥락 파악 가능." },
    { id: "why-ollama", label: "왜 Ollama?", group: "decision", description: "개발 중 API 비용 절감 (월 5만원 예산). 로컬에서 무제한 실험 가능. 프로덕션은 OpenAI." },
    { id: "why-nextjs", label: "왜 Next.js?", group: "decision", description: "정적 생성 + GitHub Pages 무료 배포 + React 생태계 + shadcn/ui 컴포넌트." },
    { id: "rag-limitation", label: "RAG의 한계", group: "decision", description: "사실 확인은 잘하지만 비교 분석, 인과 관계, 전체 요약에서 실패. ATHENA가 GraphRAG를 선택한 근거." },

    // Concepts (커리큘럼 재구성 추가)
    { id: "rag-intro", label: "RAG 개념", group: "concept", description: "LLM의 한계를 외부 지식 검색으로 보강하는 핵심 아이디어", relatedStudy: "rag-intro" },
    { id: "hallucination", label: "환각 (Hallucination)", group: "concept", description: "LLM이 그럴듯하지만 틀린 정보를 자신 있게 생성하는 현상", relatedStudy: "rag-intro" },
    { id: "knowledge-cutoff", label: "지식 커트오프", group: "concept", description: "LLM이 학습 데이터 이후의 정보를 알지 못하는 한계", relatedStudy: "rag-intro" },
    { id: "cypher", label: "Cypher 쿼리", group: "concept", description: "Neo4j의 그래프 쿼리 언어. MATCH-WHERE-RETURN 패턴으로 관계를 탐색", relatedStudy: "neo4j-kg-basics" },
    { id: "llm", label: "LLM", group: "concept", description: "대규모 언어 모델. 다음 토큰을 예측하여 텍스트를 생성하는 딥러닝 모델", relatedStudy: "transformer-llm" },
    { id: "attention", label: "어텐션 메커니즘", group: "concept", description: "Transformer의 핵심. 모든 위치에서 모든 위치로 직접 관계를 계산", relatedStudy: "transformer-llm" },

    // Architecture (커리큘럼 재구성 추가)
    { id: "protov1", label: "PROTOv1", group: "architecture", description: "ATHENA 초기 프로토타입. Chainlit + ChromaDB + Ollama 기반 단순 RAG", relatedStudy: "athena-architecture" },
    { id: "v2", label: "ATHENA v2", group: "architecture", description: "GraphRAG + Neo4j 기반 차세대 아키텍처. 인과 추론과 Notion 연동", relatedStudy: "athena-architecture" },

    // Technology (커리큘럼 재구성 추가)
    { id: "langchain", label: "LangChain", group: "technology", description: "LLM 애플리케이션 프레임워크. RAG 파이프라인 구축에 활용" },
  ],
  links: [
    // RAG 파이프라인 흐름
    { source: "chunking", target: "embedding", type: "enables", label: "입력 제공" },
    { source: "embedding", target: "vector-search", type: "enables", label: "벡터화" },
    { source: "vector-search", target: "rag", type: "part_of", label: "검색 단계" },
    { source: "rag", target: "graphrag", type: "evolves_to", label: "진화" },

    // GraphRAG 구조
    { source: "entity-extraction", target: "knowledge-graph", type: "enables", label: "엔티티→노드" },
    { source: "knowledge-graph", target: "community-detection", type: "enables", label: "구조 분석" },
    { source: "community-detection", target: "graphrag", type: "part_of", label: "커뮤니티 요약" },
    { source: "graphrag", target: "athena", type: "part_of", label: "핵심 기술" },

    // ATHENA 시스템
    { source: "athena", target: "neo4j", type: "uses", label: "그래프 저장" },
    { source: "athena", target: "pipeline", type: "uses", label: "데이터 처리" },
    { source: "pipeline", target: "chunking", type: "part_of", label: "1단계" },
    { source: "pipeline", target: "embedding", type: "part_of", label: "2단계" },
    { source: "pipeline", target: "knowledge-graph", type: "part_of", label: "3단계" },

    // 기술 선택
    { source: "athena", target: "python", type: "uses", label: "백엔드" },
    { source: "athena", target: "ollama", type: "uses", label: "개발용 LLM" },
    { source: "athena", target: "openai", type: "uses", label: "프로덕션 LLM" },
    { source: "athena", target: "notion", type: "uses", label: "지식 소스" },
    { source: "nextjs", target: "athena", type: "part_of", label: "학습 웹" },

    // 벡터 DB 비교
    { source: "chromadb", target: "vector-search", type: "enables", label: "벡터 저장" },
    { source: "faiss", target: "vector-search", type: "enables", label: "벡터 검색" },
    { source: "chromadb", target: "faiss", type: "compares", label: "대안" },

    // 개념 연결
    { source: "embedding", target: "cosine-similarity", type: "uses", label: "유사도 측정" },
    { source: "prompt-engineering", target: "rag", type: "enables", label: "질문 구성" },

    // 커리큘럼 개념 연결
    { source: "ai-ml-basics", target: "nlp-basics", type: "enables", label: "기반 지식" },
    { source: "nlp-basics", target: "embedding", type: "enables", label: "텍스트→벡터" },
    { source: "transformer", target: "ollama", type: "enables", label: "모델 이해" },
    { source: "transformer", target: "openai", type: "enables", label: "모델 이해" },

    // 의사결정 연결
    { source: "why-neo4j", target: "neo4j", type: "depends_on", label: "선택 근거" },
    { source: "why-python", target: "python", type: "depends_on", label: "선택 근거" },
    { source: "why-graphrag", target: "graphrag", type: "depends_on", label: "선택 근거" },
    { source: "why-ollama", target: "ollama", type: "depends_on", label: "선택 근거" },
    { source: "why-nextjs", target: "nextjs", type: "depends_on", label: "선택 근거" },
    { source: "rag-limitation", target: "rag", type: "depends_on", label: "한계 분석" },
    { source: "rag-limitation", target: "why-graphrag", type: "enables", label: "전환 근거" },

    // RAG 개념 관련
    { source: "hallucination", target: "rag-intro", type: "enables", label: "해결 동기" },
    { source: "knowledge-cutoff", target: "rag-intro", type: "enables", label: "해결 동기" },
    { source: "rag-intro", target: "rag", type: "enables", label: "개념→아키텍처" },

    // LLM/Transformer 관련
    { source: "attention", target: "transformer", type: "part_of", label: "핵심 메커니즘" },
    { source: "transformer", target: "llm", type: "enables", label: "기반 구조" },
    { source: "llm", target: "hallucination", type: "enables", label: "부작용" },
    { source: "llm", target: "rag", type: "enables", label: "생성 엔진" },

    // Neo4j/Cypher 관련
    { source: "cypher", target: "neo4j", type: "part_of", label: "쿼리 언어" },
    { source: "neo4j", target: "knowledge-graph", type: "enables", label: "그래프 저장" },

    // ATHENA 아키텍처 관련
    { source: "protov1", target: "v2", type: "evolves_to", label: "진화" },
    { source: "protov1", target: "rag", type: "uses", label: "기본 RAG" },
    { source: "protov1", target: "chromadb", type: "uses", label: "벡터 저장" },
    { source: "v2", target: "graphrag", type: "uses", label: "핵심 기술" },
    { source: "v2", target: "neo4j", type: "uses", label: "그래프 DB" },
    { source: "v2", target: "notion", type: "uses", label: "데이터 소스" },
    { source: "athena", target: "protov1", type: "uses", label: "1세대" },
    { source: "athena", target: "v2", type: "uses", label: "2세대" },

    // 기술 연결
    { source: "langchain", target: "rag", type: "enables", label: "구현 프레임워크" },

    // 커리큘럼 흐름 추가
    { source: "ai-ml-basics", target: "embedding", type: "enables", label: "기반 지식" },
    { source: "embedding", target: "rag-intro", type: "enables", label: "검색 기반" },
  ],
};
