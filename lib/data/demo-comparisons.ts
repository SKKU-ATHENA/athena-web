export interface DemoQuestion {
  id: string;
  category: "fact" | "simple" | "comparison" | "causal" | "summary";
  categoryLabel: string;
  question: string;
  ragResponse: {
    text: string;
    verdict: "success" | "partial" | "fail";
    verdictLabel: string;
    verdictDetail: string;
  };
  graphragResponse: {
    text: string;
    verdict: "success" | "partial" | "fail";
    verdictLabel: string;
    verdictDetail: string;
  };
  keyDifference: string;
}

export const demoQuestions: DemoQuestion[] = [
  // Category 1: 사실 확인 — RAG ✓ (빠르고 간결)
  {
    id: "fact-1",
    category: "fact",
    categoryLabel: "사실 확인",
    question: "ATHENA 프로젝트에서 사용하는 프로그래밍 언어는?",
    ragResponse: {
      text: "ATHENA 프로젝트는 Python 3.11을 사용합니다. 주요 의존성으로는 Neo4j 드라이버, LangChain, 그리고 OpenAI/Anthropic SDK가 있습니다.",
      verdict: "success",
      verdictLabel: "✅ 정확하고 간결",
      verdictDetail: "단순 사실 확인에는 RAG가 빠르고 충분합니다.",
    },
    graphragResponse: {
      text: "ATHENA 프로젝트의 주 언어는 Python 3.11입니다. 이 선택의 배경에는 팀원 전원의 Python 숙련도, AI/ML 생태계(LangChain, OpenAI SDK)의 풍부함, 그리고 Neo4j 공식 Python 드라이버의 안정성이 있습니다. 프론트엔드(학습 웹)는 별도로 Next.js(TypeScript)를 사용합니다.",
      verdict: "success",
      verdictLabel: "✅ 정확 + 맥락",
      verdictDetail: "정확하지만 단순 질문에는 과잉 정보일 수 있습니다.",
    },
    keyDifference: "단순 사실 확인에서 RAG는 빠르고 간결합니다. GraphRAG는 정확하지만 불필요한 맥락까지 포함하여 답변이 길어질 수 있습니다.",
  },
  {
    id: "fact-2",
    category: "fact",
    categoryLabel: "사실 확인",
    question: "프로젝트의 마일스톤 M1의 목표는?",
    ragResponse: {
      text: "M1(4월)의 목표는 PROTOv1 개선과 v2 핵심 파이프라인 구축입니다.",
      verdict: "success",
      verdictLabel: "✅ 정확",
      verdictDetail: "문서에서 직접 검색 가능한 정보를 정확히 반환합니다.",
    },
    graphragResponse: {
      text: "M1(4월)의 목표는 두 가지입니다: (1) 기존 PROTOv1의 성능 개선 — 청킹 전략과 프롬프트 최적화 중심, (2) v2 핵심 파이프라인 구축 — Neo4j 기반 KG 구축 + GraphRAG 통합. M0(인프라 세팅)에서 구축한 환경 위에서 진행되며, M2(5월, Notion 연동)의 선행 조건입니다.",
      verdict: "success",
      verdictLabel: "✅ 정확 + 의존관계",
      verdictDetail: "마일스톤 간 의존관계까지 설명하지만 질문 대비 과잉입니다.",
    },
    keyDifference: "RAG는 필요한 답만 정확히 줍니다. GraphRAG는 전후 맥락(M0→M1→M2)까지 연결하지만, 단순 질문에는 오버킬.",
  },

  // Category 2: 단순 검색 — RAG ✓ (충분)
  {
    id: "simple-1",
    category: "simple",
    categoryLabel: "단순 검색",
    question: "ATHENA에서 사용할 수 있는 LLM 옵션은?",
    ragResponse: {
      text: "ATHENA에서 사용 가능한 LLM 옵션:\n• 개발용: Ollama (로컬, 무료)\n• 프로덕션: OpenAI GPT-4o, GPT-4o-mini\n• 대안: Anthropic Claude Sonnet\n\n월 예산 5만원 한도 내에서 운영합니다.",
      verdict: "success",
      verdictLabel: "✅ 충분한 목록",
      verdictDetail: "목록형 질문에 RAG가 잘 대응합니다.",
    },
    graphragResponse: {
      text: "ATHENA의 LLM 전략은 비용 효율을 중심으로 설계되었습니다:\n\n개발 단계: Ollama(로컬) — 월 예산 5만원 제약 때문에 선택. Llama 3, Mistral 등 오픈소스 모델 실행.\n\n프로덕션/평가: OpenAI GPT-4o(고가, 데모/평가 시만), GPT-4o-mini(일상적 사용), Anthropic Claude Sonnet(대안).\n\n이 이중 전략은 총 API 예산 20만원(전체 지원금 50만원 중) 제약에서 비롯되었습니다.",
      verdict: "success",
      verdictLabel: "✅ 전략 + 근거",
      verdictDetail: "목록 + 왜 이런 구성인지 근거까지 설명합니다.",
    },
    keyDifference: "둘 다 정확하지만, RAG는 '무엇'을 나열하고, GraphRAG는 '왜 이렇게 구성했는지'까지 설명합니다.",
  },

  // Category 3: 비교 분석 — RAG ⚠️
  {
    id: "compare-1",
    category: "comparison",
    categoryLabel: "비교 분석",
    question: "ChromaDB와 FAISS 중 ATHENA에 더 적합한 것은?",
    ragResponse: {
      text: "ChromaDB는 오픈소스 벡터 데이터베이스이고, FAISS는 Facebook에서 만든 벡터 유사도 검색 라이브러리입니다. ChromaDB는 사용이 쉽고, FAISS는 대규모 데이터에서 빠릅니다.",
      verdict: "partial",
      verdictLabel: "⚠️ 나열만 함",
      verdictDetail: "두 기술의 특징을 나열하지만, ATHENA 맥락에서의 적합성 판단이 없습니다.",
    },
    graphragResponse: {
      text: "ATHENA의 초기 프로토타입(v1)에서는 ChromaDB가 더 적합합니다:\n\n1. 빠른 실험: ChromaDB는 설치 즉시 사용 가능, FAISS는 별도 인덱스 빌드 필요\n2. 데이터 규모: ATHENA의 현재 문서량(수백 개)은 FAISS의 대규모 최적화가 불필요\n3. 메타데이터: ChromaDB는 메타데이터 필터링 내장, FAISS는 별도 구현 필요\n\n단, v2에서 Neo4j의 벡터 인덱스로 전환 예정이므로, 벡터 DB 선택은 프로토타입 단계에만 영향합니다.",
      verdict: "success",
      verdictLabel: "✅ 맥락 기반 판단",
      verdictDetail: "ATHENA의 상황(데이터 규모, 개발 단계)을 고려한 구체적 추천입니다.",
    },
    keyDifference: "RAG는 일반적 비교만 가능합니다. GraphRAG는 프로젝트 맥락(데이터 규모, 개발 단계, 향후 계획)을 고려하여 실질적 추천을 합니다.",
  },

  // Category 4: 인과 관계 — RAG ✗
  {
    id: "causal-1",
    category: "causal",
    categoryLabel: "인과 관계",
    question: "ATHENA가 Neo4j를 선택한 이유와 그 결정이 아키텍처에 미친 영향은?",
    ragResponse: {
      text: "Neo4j는 그래프 데이터베이스로, ATHENA 프로젝트에서 Knowledge Graph를 저장하는 데 사용됩니다. Neo4j는 노드와 관계를 효율적으로 저장하며 Cypher 쿼리 언어를 지원합니다.",
      verdict: "fail",
      verdictLabel: "❌ 인과관계 누락",
      verdictDetail: "'왜' 선택했는지, 그 선택이 '어떤 영향'을 미쳤는지 답하지 못합니다.",
    },
    graphragResponse: {
      text: "Neo4j 선택의 인과 사슬:\n\n근본 원인: ATHENA의 핵심 목표는 '왜?' 질문에 인과 사슬로 답하는 것\n→ 의사결정 근거를 저장하려면 엔티티 간 관계가 핵심\n→ 관계형 DB의 JOIN은 다단계 관계 탐색에 비효율적\n→ 그래프 DB가 자연스러운 선택\n\n왜 Neo4j인가:\n1. Cypher 쿼리로 3~4단계 관계 탐색이 한 줄로 가능\n2. 벡터 인덱스 내장(v5.11+)으로 별도 벡터 DB 불필요\n3. APOC 라이브러리로 엔티티 추출 파이프라인 구축 용이\n\n아키텍처 영향:\n• 벡터 DB(ChromaDB/FAISS)가 프로토타입용으로 격하\n• GraphRAG의 커뮤니티 탐지가 Neo4j의 GDS 라이브러리와 직접 연동\n• Notion 연동(M2) 시 문서→KG 변환 파이프라인이 Neo4j 중심으로 설계",
      verdict: "success",
      verdictLabel: "✅ 인과 사슬 완성",
      verdictDetail: "목표→제약→선택→결과의 인과 사슬을 완전히 추적합니다.",
    },
    keyDifference: "RAG는 '무엇'만 답합니다. GraphRAG는 '왜 → 어떻게 → 결과'의 인과 사슬을 추적하여 의사결정의 전체 맥락을 복원합니다.",
  },
  {
    id: "causal-2",
    category: "causal",
    categoryLabel: "인과 관계",
    question: "기본 RAG에서 GraphRAG로 전환하게 된 근본적인 이유는?",
    ragResponse: {
      text: "GraphRAG는 Microsoft에서 개발한 기술로, Knowledge Graph를 활용하여 RAG의 성능을 향상시킵니다. ATHENA 프로젝트에서 GraphRAG를 사용하기로 결정했습니다.",
      verdict: "fail",
      verdictLabel: "❌ 근본 이유 없음",
      verdictDetail: "'결정했다'는 사실만 반복하고 왜 전환했는지 설명하지 못합니다.",
    },
    graphragResponse: {
      text: "전환의 근본 원인은 ATHENA의 핵심 가치와 기본 RAG의 구조적 한계 사이의 충돌입니다:\n\nATHENA의 핵심: '왜 이 결정을 했는가?'에 답하는 시스템\n→ 이 질문은 본질적으로 다단계 인과 추론을 요구함\n\n기본 RAG의 구조적 한계:\n• 벡터 유사도는 '의미적 가까움'만 측정 → 인과관계는 '의미적 가까움'이 아님\n• Top-K 검색은 독립적 청크를 반환 → 청크 간 관계(A→B→C) 정보 손실\n• 프롬프트에 주입된 청크는 맥락 없는 조각 → LLM이 인과 사슬을 재구성할 수 없음\n\n사전 과제에서 팀원들이 직접 체험하는 한계:\n• 사실 확인 ✓ → 비교 ⚠️ → 인과 관계 ✗ → 전체 요약 ✗\n\nGraphRAG가 해결하는 방식:\n• 엔티티 추출 → 관계 명시적 저장 → 인과 사슬 보존\n• 커뮤니티 요약 → 전체 맥락 파악 가능\n• 다단계 검색 → A→B→C 관계 추적",
      verdict: "success",
      verdictLabel: "✅ 구조적 분석",
      verdictDetail: "핵심 가치 충돌 → 구조적 한계 분석 → 해결 방식까지 완전한 인과 사슬.",
    },
    keyDifference: "이것이 ATHENA가 존재하는 이유입니다. RAG는 '전환했다'는 사실만 말하고, GraphRAG는 '왜 전환할 수밖에 없었는지'를 구조적으로 증명합니다.",
  },

  // Category 5: 전체 요약 — RAG ✗
  {
    id: "summary-1",
    category: "summary",
    categoryLabel: "전체 요약",
    question: "ATHENA 프로젝트의 기술적 의사결정을 전체적으로 요약해줘.",
    ragResponse: {
      text: "ATHENA는 Python을 사용하고 Neo4j 데이터베이스를 쓰며 Ollama와 OpenAI를 LLM으로 활용합니다. 프론트엔드는 Next.js로 구축되어 있고 GitHub Pages에 배포됩니다.",
      verdict: "fail",
      verdictLabel: "❌ 나열에 불과",
      verdictDetail: "기술 목록만 나열하고 의사결정 간 연결 관계를 파악하지 못합니다.",
    },
    graphragResponse: {
      text: "ATHENA의 기술적 의사결정은 하나의 원칙에서 파생됩니다:\n\n핵심 원칙: '왜?' 질문에 인과 사슬로 답할 수 있어야 한다.\n\n이 원칙이 만든 의사결정 트리:\n\n1. 저장: Neo4j (관계형 DB의 JOIN 한계 → 그래프 네이티브 필요)\n2. 검색: GraphRAG (벡터 유사도의 인과 추론 한계 → KG 기반 다단계 검색)\n3. 비용: Ollama 개발 + OpenAI 프로덕션 (월 5만원 예산 → 이중 전략)\n4. 프로토타입: ChromaDB → Neo4j 벡터 인덱스 (v2에서 통합, 별도 벡터 DB 제거)\n5. 학습: Next.js + GitHub Pages (팀원 학습 + 발표 쇼케이스 동시 충족)\n\n모든 결정이 '인과 추론'이라는 하나의 축을 중심으로 정렬되어 있습니다.",
      verdict: "success",
      verdictLabel: "✅ 구조적 요약",
      verdictDetail: "하나의 원칙에서 파생된 의사결정 트리로 전체를 구조화합니다.",
    },
    keyDifference: "RAG는 부분을 나열합니다. GraphRAG는 전체를 하나의 원칙으로 구조화하여 요약합니다. 이것이 Knowledge Graph의 진정한 가치입니다.",
  },
];

export const categoryDescriptions: Record<DemoQuestion["category"], { label: string; ragCapability: string; description: string }> = {
  fact: { label: "사실 확인", ragCapability: "✅ RAG 충분", description: "문서에서 직접 검색 가능한 단순 사실. RAG가 빠르고 정확합니다." },
  simple: { label: "단순 검색", ragCapability: "✅ RAG 충분", description: "목록이나 옵션을 나열하는 질문. RAG로 충분히 대응 가능합니다." },
  comparison: { label: "비교 분석", ragCapability: "⚠️ RAG 부분적", description: "두 기술의 장단점을 프로젝트 맥락에서 비교. RAG는 일반 비교만 가능합니다." },
  causal: { label: "인과 관계", ragCapability: "❌ RAG 실패", description: "'왜?' 질문. 의사결정의 근거와 영향을 추적해야 합니다." },
  summary: { label: "전체 요약", ragCapability: "❌ RAG 실패", description: "프로젝트 전체를 구조적으로 요약. 부분 나열이 아닌 전체 맥락 파악이 필요합니다." },
};
