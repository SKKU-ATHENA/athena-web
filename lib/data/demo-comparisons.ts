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
  // ── Category 1: 사실 확인 — RAG 충분 ──
  {
    id: "fact-1",
    category: "fact",
    categoryLabel: "사실 확인",
    question: "ARES에서 군인 회원의 회비 정책은?",
    ragResponse: {
      text: "군인 회원은 최대 4학기 회비가 면제됩니다. 이는 2026년 3월 6일 운영진 주간회의에서 결정되었습니다.",
      verdict: "success",
      verdictLabel: "✅ 정확하고 간결",
      verdictDetail: "문서에서 직접 검색하여 정확한 정책을 반환합니다.",
    },
    graphragResponse: {
      text: "군인 회원은 최대 4학기 회비가 면제됩니다.\n\n이 결정의 배경: 군 복무 중인 회원의 경제적 부담을 줄여 동아리 잔류율을 높이기 위함입니다. 같은 회의에서 외부 물품 대여 정책(무상, 총회 발표 1회 필수)과 문서화 의무(설계서/시험계획서/시험보고서)도 함께 결정되었습니다.",
      verdict: "success",
      verdictLabel: "✅ 정확 + 맥락",
      verdictDetail: "정확하지만 단순 질문에는 과잉 정보. 같은 회의의 다른 결정까지 연결합니다.",
    },
    keyDifference: "단순 사실 확인은 RAG로 충분합니다. GraphRAG는 같은 회의에서 이루어진 관련 결정까지 연결하지만 질문 대비 과잉일 수 있습니다.",
  },
  {
    id: "fact-2",
    category: "fact",
    categoryLabel: "사실 확인",
    question: "신규 로켓의 최대 도달 고도는?",
    ragResponse: {
      text: "신규 로켓은 최대 고도 340m에 도달했습니다.",
      verdict: "success",
      verdictLabel: "✅ 정확",
      verdictDetail: "발사 디브리핑 문서에서 직접 검색한 수치입니다.",
    },
    graphragResponse: {
      text: "신규 로켓의 최대 도달 고도는 340m입니다.\n\n전자팀 디브리핑에 따르면, 이지미니(기존 사출체) 사출은 성공했지만, 자체 보드로의 사출은 실패했습니다. 실패 원인은 릴레이-화약 연결선의 단선(HW 연결 신뢰성 문제)이었으며, 사출 판단 알고리즘 자체는 정상 동작했습니다.",
      verdict: "success",
      verdictLabel: "✅ 정확 + 비행 결과",
      verdictDetail: "고도뿐 아니라 해당 비행의 성공/실패 맥락까지 포함합니다.",
    },
    keyDifference: "RAG는 숫자 하나를 정확히 반환합니다. GraphRAG는 그 비행에서 무슨 일이 있었는지 전체 맥락을 제공합니다.",
  },

  // ── Category 2: 단순 검색 — RAG 충분 ──
  {
    id: "simple-1",
    category: "simple",
    categoryLabel: "단순 검색",
    question: "로켓 제작 시 의무적으로 작성해야 하는 문서는?",
    ragResponse: {
      text: "로켓 제작 시 의무적으로 작성해야 하는 문서는 3종입니다:\n\n1. 설계서\n2. 시험 계획서\n3. 시험 보고서",
      verdict: "success",
      verdictLabel: "✅ 정확한 목록",
      verdictDetail: "2026년 3월 운영진 회의에서 결정된 문서화 의무를 정확히 반환합니다.",
    },
    graphragResponse: {
      text: "로켓 제작 시 설계서, 시험 계획서, 시험 보고서 3종을 의무적으로 작성해야 합니다.\n\n이 의무가 생긴 배경:\n- 노션에 남아있는 자료가 태평성대호밖에 없었음\n- 이공이호, MAGA-I~IV 자료가 체계적으로 보존되지 않아 후임자가 처음부터 시작해야 하는 비효율 발생\n- 추진팀은 모터 제작을 매 기수 반복하고, 전자팀은 코드를 이해 없이 복붙하는 문제가 발생\n\n이러한 지식 소실 문제를 해결하기 위해 문서화를 의무화했습니다.",
      verdict: "success",
      verdictLabel: "✅ 목록 + 배경",
      verdictDetail: "문서 목록뿐 아니라 왜 이 의무가 생겼는지 지식 소실의 구체적 사례까지 설명합니다.",
    },
    keyDifference: "RAG는 '무엇을 써야 하는지' 답합니다. GraphRAG는 '왜 쓰게 되었는지'까지 — 이것이 바로 ATHENA가 해결하려는 '과정 지식'입니다.",
  },

  // ── Category 3: 비교 분석 — RAG 부분적 ──
  {
    id: "compare-1",
    category: "comparison",
    categoryLabel: "비교 분석",
    question: "이중사출 1차~4차 시도에서 각각 무엇이 달랐나?",
    ragResponse: {
      text: "이중사출은 여러 차례 시도되었습니다. 4차에서 성공했으며, 재료를 GFRP(유리섬유)로 변경한 것이 핵심이었습니다.",
      verdict: "partial",
      verdictLabel: "⚠️ 부분적",
      verdictDetail: "4차 성공은 맞지만, 1~3차 각각의 변경과 실패 원인을 구분하지 못합니다.",
    },
    graphragResponse: {
      text: "이중사출 검증 과정에서 매 차수마다 다른 접근법을 시도했습니다:\n\n1차: COP(시어핀) 최초 설계 → 실패. 시어핀 3개 중 1개가 파단되지 않음. 지관 끼임, 노즈콘 짧음, 시어핀 위치 낮음\n\n2차: 노즈콘 커플러 길이 증가 + 시어핀 위치 상승 → 실패. 여전히 시어핀 파단 불완전\n\n3차: 화약량 1.9g으로 증가 → 실패. 지관이 결대로 찢어짐 — 재료 자체의 구조적 한계 확인\n\n4차: 상구 동체 재료를 지관 → GFRP(유리섬유)로 전면 변경 → 성공. 시어핀 3개 모두 깔끔하게 파단\n\n핵심 교훈: 1~3차는 구조(위치, 크기) 또는 에너지(화약량) 변경이었으나, 근본 원인은 재료의 인장력 한계였습니다. 문제의 본질을 파악한 4차에서 재료 변경으로 해결했습니다.",
      verdict: "success",
      verdictLabel: "✅ 완전한 비교",
      verdictDetail: "각 차수의 변경-결과-실패원인을 시간순으로 추적하고, 근본 원인까지 분석합니다.",
    },
    keyDifference: "RAG는 결론(4차 성공)만 찾습니다. GraphRAG는 1→2→3→4차의 시행착오 과정 전체를 인과 사슬로 재구성하여, 왜 이전 시도가 실패하고 마지막에 성공했는지를 보여줍니다.",
  },

  // ── Category 4: 인과 관계 — RAG 실패 ──
  {
    id: "causal-1",
    category: "causal",
    categoryLabel: "인과 관계",
    question: "이중사출 로켓의 상구 동체를 왜 GFRP로 변경했나?",
    ragResponse: {
      text: "관련 문서에서 GFRP(유리섬유) 변경에 대한 언급을 찾았습니다. GFRP는 강도와 경량성이 뛰어난 소재입니다.",
      verdict: "fail",
      verdictLabel: "❌ 인과관계 누락",
      verdictDetail: "GFRP가 무엇인지는 답하지만, '왜' 변경했는지 — 1~3차 실패 과정과 근본 원인을 설명하지 못합니다.",
    },
    graphragResponse: {
      text: "GFRP 변경의 인과 사슬:\n\n[1차] COP + 지관으로 이중사출 최초 설계\n→ 시어핀 3개 중 1개 파단 안 됨\n\n[2차] 노즈콘 커플러 길이 증가 + 시어핀 위치 상승으로 구조 개선\n→ 여전히 시어핀 파단 불완전\n\n[3차] 화약량을 1.9g으로 증가하여 에너지 해결 시도\n→ 지관이 결대로 찢어짐 — 화약 압력을 지관이 못 버팀\n→ 핵심 발견: 문제는 구조나 에너지가 아니라 재료의 인장력 한계\n\n[4차] 재료를 지관 → GFRP(유리섬유)로 전면 변경\n→ 시어핀 3개 모두 깔끔하게 파단 확인. ARES 최초 이중사출 성공\n\n결론: 화약량이나 구조 변경이 아니라, 재료 자체의 인장력 한계가 근본 원인이었으며, 재료 변경만이 해결책이었습니다.",
      verdict: "success",
      verdictLabel: "✅ 완전한 인과 사슬",
      verdictDetail: "4단계의 시행착오를 시간순으로 재구성하고, 근본 원인(재료 인장력)을 정확히 짚습니다.",
    },
    keyDifference: "이것이 ATHENA가 존재하는 이유입니다. RAG는 'GFRP로 바꿨다'는 결과만 찾지만, GraphRAG는 '왜 바꿀 수밖에 없었는지'를 1~4차의 시행착오 과정으로 증명합니다. 이 인과 사슬은 후임자가 같은 실수를 반복하지 않게 해줍니다.",
  },
  {
    id: "causal-2",
    category: "causal",
    categoryLabel: "인과 관계",
    question: "점화 지연 현상은 왜 발생했고 어떻게 해결할 수 있나?",
    ragResponse: {
      text: "점화 지연에 대한 내용이 발사 디브리핑 문서에 있습니다. 점화 후 이륙까지 시간이 걸렸다고 기록되어 있습니다.",
      verdict: "fail",
      verdictLabel: "❌ 원인 분석 없음",
      verdictDetail: "'지연이 있었다'는 사실만 반복하고, 왜 발생했는지 근본 원인을 분석하지 못합니다.",
    },
    graphragResponse: {
      text: "점화 지연 인과 분석:\n\n[원인] 발사 전날 새벽에 연료 몰드 제거\n→ 건조 시간을 전혀 갖지 못함\n\n[메커니즘] 장약 근처(열 영향 큰 부분)에서는 자립연소 정상 형성\n→ 그러나 화염이 약한 부분은 습기로 인해 자립연소 미형성\n→ 연소가 진행되다가 습기 많은 구간에서 자립연소 사이클이 주춤\n\n[증거] 1.24초 시점에 음향 크기가 유의미하게 하강\n→ 1.24~2.18초에 추력 점진적 회복\n→ 2.18초에 이륙 (예상보다 2초 이상 지연)\n\n[해결책]\n1. 연료 몰드 제거 후 충분한 건조 시간 확보 (즉시 적용 가능)\n2. 연료 표면 점화 화약 코팅 실험 검토 — 논문에 따르면 점화 지연 15~40% 감소 가능\n\n근본 원인은 습기 통제 실패입니다.",
      verdict: "success",
      verdictLabel: "✅ 원인→메커니즘→증거→해결",
      verdictDetail: "음향 데이터 분석 결과까지 포함하여 시간순으로 원인을 추적합니다.",
    },
    keyDifference: "RAG는 '점화 지연이 있었다'만 찾습니다. GraphRAG는 발사 전날 습기 → 자립연소 실패 → 1.24초 음향 하강 → 2.18초 이륙의 전체 인과 체인을 재구성하고, 논문 기반 해결책까지 제시합니다.",
  },

  // ── Category 5: 전체 요약 — RAG 실패 ──
  {
    id: "summary-1",
    category: "summary",
    categoryLabel: "전체 요약",
    question: "25-겨울 발사에서 어떤 문제가 있었고 어떻게 개선해야 하나?",
    ragResponse: {
      text: "25-겨울 발사에서 여러 개선 사항이 논의되었습니다. 동체팀 모터마운트 최적화, 전자팀 에비오닉스 인원 배정, 발사장 체크리스트 작성 등이 필요합니다.",
      verdict: "fail",
      verdictLabel: "❌ 나열에 불과",
      verdictDetail: "개선 항목을 일부 나열하지만, 팀별 구조화나 근본 원인 분석이 없습니다.",
    },
    graphragResponse: {
      text: "25-겨울 발사 종합 분석:\n\n추진팀:\n- 점화 지연 2.18초 발생 — 원인: 습기 통제 실패 (건조 시간 미확보)\n- 모터 조립 방식을 탭홀로 개선 → 편의성 향상 확인\n- 향후: 건조 시간 확보 + 점화 화약 코팅 실험\n\n동체팀:\n- 4차 만에 이중사출 성공 — 핵심: 지관→GFRP 재료 변경\n- 모터마운트 첫 제작 6시간 소요 → 최적화 필요\n- GFRP 공차 관리, BMP 구멍 미천공 등 현장 문제\n\n전자팀:\n- 신규 로켓 자체 보드 사출 실패 — 원인: 배선 단선 (HW, 알고리즘은 정상)\n- 삼각형 덱 구조는 미적이나 유지보수 불편 → 비추천\n- 2차 사출 알고리즘 오류: 150m 설정인데 220m에서 작동\n\n임무팀:\n- 이지미니 사출 성공, 자체 격발 실패 (카트리지 전선 이격)\n- GFRP 사출 실험 횟수 확대 필요\n\n공통: 발사장 체크리스트 사전 출력 습관화\n\n핵심 패턴: 대부분의 실패가 SW가 아닌 HW 연결 신뢰성 문제입니다.",
      verdict: "success",
      verdictLabel: "✅ 팀별 구조화 + 패턴 분석",
      verdictDetail: "팀별로 문제-원인-해결을 구조화하고, 팀을 관통하는 공통 패턴(HW 신뢰성)까지 도출합니다.",
    },
    keyDifference: "RAG는 개선 항목을 흩어진 조각으로 나열합니다. GraphRAG는 팀별로 '문제→원인→해결'을 구조화하고, 팀을 관통하는 근본 패턴까지 분석합니다. 이것이 100페이지의 디브리핑 문서를 5분 만에 파악하게 해주는 Knowledge Graph의 힘입니다.",
  },
];

export const categoryDescriptions: Record<DemoQuestion["category"], { label: string; ragCapability: string; description: string }> = {
  fact: { label: "사실 확인", ragCapability: "✅ RAG 충분", description: "문서에서 직접 검색 가능한 단순 사실. RAG가 빠르고 정확합니다." },
  simple: { label: "단순 검색", ragCapability: "✅ RAG 충분", description: "목록이나 규정을 검색하는 질문. RAG로 충분히 대응 가능합니다." },
  comparison: { label: "비교 분석", ragCapability: "⚠️ RAG 부분적", description: "여러 시도의 차이를 비교. RAG는 결론만, GraphRAG는 과정 전체를 비교합니다." },
  causal: { label: "인과 관계", ragCapability: "⚠️ 정보 분산 시 RAG 한계", description: "'왜?' 질문. 인과 사슬이 여러 문서에 분산되어 있을 때 GraphRAG가 +16.4%p 우수합니다." },
  summary: { label: "전체 요약", ragCapability: "⚠️ 크로스-문서 시 RAG 한계", description: "여러 팀의 결과를 구조적으로 종합. 분산된 정보를 연결하는 데 Knowledge Graph가 필요합니다." },
};
