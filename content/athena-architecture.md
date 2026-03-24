---
title: "ATHENA 아키텍처 딥다이브"
description: "PROTOv1에서 v2로의 진화, 전체 시스템 구조, 데이터 흐름, 설계 결정의 근거."
sources:
  - type: github
    label: "ATHENA_PROTOv1 레포"
    url: "https://github.com/your-org/ATHENA_PROTOv1"
  - type: github
    label: "microsoft/graphrag"
    url: "https://github.com/microsoft/graphrag"
---

> **30분 읽기** | 핵심: ATHENA 시스템의 전체 그림을 이해하고, 설계 결정에 참여할 수 있는 수준에 도달한다.
> Phase 3 (KG & GraphRAG)의 2번째 모듈. 이전: [Neo4j & Knowledge Graph 기초](/study/neo4j-kg-basics)

> 이 문서의 목적: ATHENA를 "사용하는 사람"이 아니라 "함께 만드는 사람"의 관점에서 이해하는 것이다. 각 설계 결정의 근거를 알아야 새로운 결정에도 참여할 수 있다.

## ATHENA의 미션

> 의사결정 근거를 Knowledge Graph로 구조화하여 "왜?" 질문에 인과 사슬로 응답한다.

이 한 문장을 분해해보자.

<div class="info-card">
  <div class="info-card-title">미션 분해</div>
  <strong>의사결정 근거</strong> — 팀이 "왜 이렇게 했는가"의 기록. 회의록, 기술 문서, 논의 내역 등에 흩어져 있다.<br/><br/>
  <strong>Knowledge Graph로 구조화</strong> — 흩어진 정보를 노드(개체)와 엣지(관계)로 연결한 그래프로 변환한다. 텍스트 덩어리가 아니라 탐색 가능한 구조가 된다.<br/><br/>
  <strong>"왜?" 질문에 인과 사슬로 응답</strong> — "왜 Neo4j를 선택했나?" → Decision 노드 → 근거 노드 → 출처 노드로 이어지는 경로를 따라 답변을 생성한다.
</div>

왜 이것이 가치가 있는가? 팀 프로젝트에서 3개월 전 결정의 이유를 기억하는 사람은 없다. Notion에 기록했더라도 "어딘가에 있다"는 것만 알 뿐, 검색해서 찾아내기 어렵다. ATHENA는 이 문제를 구조적으로 해결한다.

## PROTOv1: 어디서 시작했는가

PROTOv1은 프로젝트의 첫 번째 동작하는 프로토타입이다.

<div class="diagram-box">
  <div class="diagram-title">PROTOv1 아키텍처</div>
  <div class="flow">
    <div class="flow-badge flow-badge-primary">문서 입력</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">청킹 + 임베딩</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">ChromaDB 저장</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">벡터 검색</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">Ollama LLM</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">Chainlit UI</div>
  </div>
</div>

**기술 스택**: Chainlit(대화 UI) + ChromaDB(벡터 DB) + Ollama(로컬 LLM)

### 무엇을 잘 했는가

- **동작하는 데모**를 만들었다. 문서를 넣고 질문하면 답이 나온다.
- 로컬 환경에서 외부 API 없이 실행 가능하다.
- 기본 RAG 파이프라인의 전체 흐름을 구현했다.

### 무엇이 부족했는가

<div class="callout callout-amber">
  <strong>PROTOv1의 3가지 한계</strong><br/>
  <strong>1. 인과 추론 불가:</strong> "왜 이 기술을 선택했나?" → 유사한 텍스트 조각을 반환할 뿐, 인과 사슬을 추적하지 못한다.<br/>
  <strong>2. 전체 요약 불가:</strong> "이번 달 주요 의사결정을 요약해줘" → top-k 검색으로는 전체를 볼 수 없다.<br/>
  <strong>3. 관계 추적 불가:</strong> "A 결정이 B 결정에 어떤 영향을 줬나?" → 텍스트 청크에는 관계 정보가 없다.
</div>

핵심 모순: **잘 동작하지만 핵심 질문에 답하지 못한다.** "왜?"라는 질문이 ATHENA의 존재 이유인데, 기본 RAG로는 이에 답할 수 없다. 이것이 v2의 동기다.

## v2 아키텍처 전체 그림

v2는 PROTOv1의 한계를 **Knowledge Graph**로 극복한다.

<div class="diagram-box">
  <div class="diagram-title">ATHENA v2 전체 파이프라인</div>
  <div class="pipe-step">
    <div class="pipe-num">1</div>
    <div class="pipe-content"><strong>데이터 수집</strong><br/>Notion API로 회의록, 기술 문서, 논의 내역을 가져온다</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">2</div>
    <div class="pipe-content"><strong>전처리</strong><br/>문서를 청킹하고, 메타데이터(작성자, 날짜, 문서 유형)를 정규화한다</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">3</div>
    <div class="pipe-content"><strong>엔티티/관계 추출</strong><br/>LLM이 텍스트에서 의사결정, 기술, 인물, 근거 등의 개체와 관계를 추출한다</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">4</div>
    <div class="pipe-content"><strong>Knowledge Graph 구축</strong><br/>추출된 엔티티 → Neo4j 노드, 관계 → 엣지. 벡터 인덱스도 함께 생성한다</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">5</div>
    <div class="pipe-content"><strong>질의 처리 (GraphRAG)</strong><br/>벡터 검색으로 시작점 → 그래프 탐색으로 인과 사슬 추적 → 관련 컨텍스트 수집</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">6</div>
    <div class="pipe-content"><strong>응답 생성</strong><br/>수집된 컨텍스트(그래프 경로 + 원본 텍스트)를 LLM에 전달하여 답변 생성</div>
  </div>
</div>

### 각 컴포넌트의 기술 스택

| 컴포넌트 | 기술 | 역할 |
|----------|------|------|
| 데이터 수집 | Notion API | 팀의 기존 문서를 자동으로 가져옴 |
| 전처리 | Python (커스텀) | 청킹, 메타데이터 정규화 |
| 엔티티/관계 추출 | Ollama(개발) / OpenAI(프로덕션) | 텍스트 → 구조화된 엔티티/관계 |
| Knowledge Graph | Neo4j | 노드/엣지 저장, 벡터 인덱스, Cypher 쿼리 |
| 질의 처리 | Python + neo4j 드라이버 | 벡터 검색 + 그래프 탐색 결합 |
| 응답 생성 | Ollama(개발) / OpenAI(프로덕션) | 컨텍스트 기반 자연어 답변 |

### PROTOv1 vs v2 비교

<div class="compare-grid">
  <div class="compare-card">
    <div class="compare-title">PROTOv1</div>
    <strong>저장:</strong> ChromaDB (벡터만)<br/>
    <strong>검색:</strong> 벡터 유사도 top-k<br/>
    <strong>강점:</strong> 사실 확인 질문<br/>
    <strong>약점:</strong> 인과/요약/관계 질문<br/>
    <strong>UI:</strong> Chainlit 대화형
  </div>
  <div class="compare-card">
    <div class="compare-title">v2</div>
    <strong>저장:</strong> Neo4j (그래프 + 벡터)<br/>
    <strong>검색:</strong> 벡터 시작 → 그래프 탐색<br/>
    <strong>강점:</strong> 인과 사슬, 전체 요약, 관계 추적<br/>
    <strong>약점:</strong> 인덱싱 비용 높음 (LLM 호출)<br/>
    <strong>UI:</strong> TBD
  </div>
</div>

## 핵심 설계 결정 5가지

ATHENA v2의 아키텍처는 여러 선택의 결과다. 각 결정마다 "다른 선택지는 뭐가 있었고, 왜 이걸 골랐는가"를 이해해야 한다.

### 결정 1: 왜 Neo4j인가?

| 선택지 | 평가 |
|--------|------|
| 그래프 없이 Advanced RAG | Reranking, HyDE 등으로 개선 가능하지만 관계 추적의 근본적 한계 해결 불가 |
| NetworkX (인메모리 그래프) | 영속성 없음, 데이터 커지면 메모리 한계 |
| Neo4j | 그래프 탐색 + 벡터 인덱스 통합, Python 드라이버 완비, 무료 CE 제공 |

**결론**: ATHENA의 핵심이 인과 관계 추적인 이상, 그래프 DB는 선택이 아니라 필수. Neo4j는 기능, 생태계, 비용 면에서 최선.

### 결정 2: 왜 Ollama + OpenAI 하이브리드인가?

<div class="callout callout-amber">
  <strong>ATHENA의 API 비용 규칙</strong><br/>
  총 예산: API 20만원 (전체 지원금 50만원 중). 월별 한도: 5만원/월.<br/>
  개발 중에는 Ollama 로컬 모델 우선. 고가 모델은 평가/데모 시에만.
</div>

| 상황 | 모델 | 이유 |
|------|------|------|
| 개발/테스트 | Ollama (로컬) | 비용 0원, 빠른 반복 |
| 엔티티 추출 (인덱싱) | gpt-4o-mini | 정확도 필요하지만 저가 모델로 충분 |
| 최종 답변 생성 (데모) | gpt-4o / claude-sonnet | 높은 품질이 필요한 데모/평가 시에만 |

**핵심**: 개발 속도와 비용의 균형. 로컬 모델로 빠르게 반복하고, 품질이 중요한 순간에만 클라우드 API를 쓴다.

### 결정 3: 왜 Notion 연동인가?

| 선택지 | 평가 |
|--------|------|
| 수동 파일 업로드 | 팀원들이 매번 파일을 변환해서 올려야 함 → 사용 안 하게 됨 |
| GitHub 이슈/위키 | 회의록, 논의 내역은 GitHub보다 Notion에 더 많이 기록됨 |
| Notion API | 팀이 이미 Notion을 사용 중. 추가 작업 없이 기존 워크플로우에서 데이터 수집 가능 |

**핵심**: 가장 좋은 데이터 파이프라인은 팀이 **추가 작업 없이** 사용할 수 있는 것이다. Notion은 이미 팀의 일상 도구다.

### 결정 4: 왜 LLM으로 엔티티를 추출하는가?

<div class="compare-grid">
  <div class="compare-card">
    <div class="compare-title">수동 태깅</div>
    사람이 직접 문서를 읽고 엔티티/관계를 태깅<br/><br/>
    <strong>문제:</strong> 6명의 팀이 수백 개 문서를 태깅? 비현실적.
  </div>
  <div class="compare-card">
    <div class="compare-title">규칙 기반 (NER)</div>
    사전 정의된 패턴으로 엔티티 추출<br/><br/>
    <strong>문제:</strong> "이 기술을 도입한 이유는"같은 암묵적 관계를 잡지 못함.
  </div>
  <div class="compare-card">
    <div class="compare-title">LLM 기반 추출</div>
    LLM이 텍스트를 읽고 엔티티/관계를 구조화<br/><br/>
    <strong>장점:</strong> 맥락을 이해하여 암묵적 관계까지 추출. 프롬프트 조정으로 커스터마이징 가능.
  </div>
</div>

**핵심**: 의사결정의 근거는 명시적으로 "이것은 근거입니다"라고 쓰여 있지 않다. 맥락을 이해하는 LLM만이 이를 추출할 수 있다.

### 결정 5: 왜 GraphRAG인가?

이것은 앞선 4가지 결정의 귀결이다.

<div class="diagram-box">
  <div class="diagram-title">기본 RAG의 한계 → GraphRAG의 필요성</div>
  <div class="pipe-step">
    <div class="pipe-num">1</div>
    <div class="pipe-content"><strong>기본 RAG</strong>: "왜 Neo4j를 선택했나?" → 유사 텍스트 반환 (인과 사슬 없음)</div>
  </div>
  <div class="pipe-arrow">↓ 한계 인식</div>
  <div class="pipe-step">
    <div class="pipe-num">2</div>
    <div class="pipe-content"><strong>GraphRAG</strong>: 같은 질문 → Decision 노드 → 근거 엣지 → Reason 노드 → 출처 엣지 → Document 노드</div>
  </div>
  <div class="pipe-arrow">↓ 결과</div>
  <div class="pipe-step">
    <div class="pipe-num">3</div>
    <div class="pipe-content"><strong>"Neo4j를 선택한 이유는: (1) 인과 관계 추적이 핵심이고 (2) 벡터 인덱스를 내장하며 (3) Python 드라이버가 완비되었기 때문이다. 출처: M1 회의록 2026-04-03."</strong></div>
  </div>
</div>

기본 RAG가 "관련 있는 텍스트"를 반환하는 반면, GraphRAG는 **근거가 있는 인과 사슬**을 반환한다. ATHENA의 미션에 정확히 부합한다.

## 마일스톤과 팀 역할

### 마일스톤 로드맵

| 마일스톤 | 기간 | 목표 | 핵심 산출물 |
|----------|------|------|-------------|
| **M0** | ~3월 | 인프라 세팅, 팀 온보딩 | 개발 환경, 학습 웹사이트, 사전 과제 |
| **M1** | 4월 | PROTOv1 개선 + v2 핵심 파이프라인 | Neo4j 기반 KG 구축, 엔티티 추출 파이프라인 |
| **M2** | 5월 | v2 완성 + Notion 연동 | 전체 GraphRAG 파이프라인, Notion 자동 수집 |
| **M3** | 6월 초 | 테스트, 평가, 최적화 | 성능 벤치마크, 품질 평가 |
| **M4** | 6월 중 | 발표 준비 + 최종 제출 | 데모, 발표 자료, 최종 보고서 |

### 전체 구조에서 나의 위치

<div class="callout callout-amber">
  <strong>자신의 역할을 전체에서 파악하자</strong><br/>
  <strong>데이터 수집 담당:</strong> Notion API 연동 → 파이프라인의 시작점. 데이터 품질이 전체 성능을 좌우한다.<br/>
  <strong>엔티티 추출 담당:</strong> LLM 프롬프트 엔지니어링 → 그래프 품질의 핵심. 추출 정확도가 답변 품질을 결정한다.<br/>
  <strong>KG 구축 담당:</strong> Neo4j 스키마 설계 → v2의 심장. 어떤 노드/엣지/속성을 설계하느냐가 "왜?" 질문 대응 능력을 결정한다.<br/>
  <strong>질의/응답 담당:</strong> GraphRAG 검색 로직 → 사용자가 직접 체감하는 부분. 그래프 탐색 전략이 답변 품질을 결정한다.<br/>
  <strong>프론트엔드 담당:</strong> UI/UX → 시스템의 얼굴. 인과 사슬을 사용자에게 어떻게 보여줄지 결정한다.<br/>
  <strong>인프라/평가 담당:</strong> CI/CD, 성능 측정 → 팀 전체의 생산성과 품질 보증의 기반.
</div>

어떤 컴포넌트를 담당하든, 전체 파이프라인에서 자기 부분의 **입력과 출력**이 무엇인지 명확히 알아야 한다. 내 컴포넌트의 출력이 다음 컴포넌트의 입력이 되기 때문이다.

## 체크포인트

ATHENA 아키텍처를 이해했는지 확인하자. 이 질문들에 답할 수 있다면, 팀 미팅에서 설계 논의에 참여할 준비가 된 것이다.

<details>
<summary>Q1. PROTOv1과 v2의 핵심 차이 3가지는?</summary>

1. **저장소**: ChromaDB(벡터만) → Neo4j(그래프 + 벡터). 관계를 구조적으로 저장할 수 있게 되었다.
2. **검색 방식**: 벡터 유사도 top-k → 벡터 검색 + 그래프 탐색. "왜?" 질문에 인과 사슬로 답할 수 있게 되었다.
3. **데이터 처리**: 단순 청킹 → LLM 기반 엔티티/관계 추출. 텍스트를 구조화된 지식으로 변환한다.

</details>

<details>
<summary>Q2. 데이터가 시스템을 통과하는 전체 흐름을 설명할 수 있는가?</summary>

1. **수집**: Notion API로 회의록/문서를 가져온다
2. **전처리**: 청킹 + 메타데이터 정규화
3. **추출**: LLM이 텍스트에서 엔티티(의사결정, 기술, 인물 등)와 관계(근거, 대체, 도입 등)를 추출
4. **저장**: 엔티티 → Neo4j 노드, 관계 → 엣지, 텍스트 → 벡터 인덱스
5. **검색**: 사용자 질문 → 벡터 검색으로 시작 노드 → 그래프 탐색으로 인과 사슬 수집
6. **생성**: 수집된 그래프 경로 + 원본 텍스트를 LLM에 전달 → 자연어 답변

</details>

<details>
<summary>Q3. Neo4j를 선택한 근거를 다른 팀원에게 설명할 수 있는가?</summary>

"ATHENA의 핵심은 '왜?'라는 인과 관계 추적이야. 인과 관계를 따라가는 건 본질적으로 그래프 탐색이고, 그래프 DB가 이걸 가장 잘해. Neo4j를 고른 이유는 4가지야: (1) 그래프 DB 중 가장 성숙하고, (2) 벡터 인덱스를 내장해서 별도 벡터 DB 없이도 되고, (3) Python 드라이버가 잘 돼 있고, (4) 무료 Community Edition으로 충분해."

핵심은 "관계 추적이 핵심 → 그래프 DB 필연 → Neo4j가 최선"이라는 논리 흐름이다.

</details>

<details>
<summary>Q4. 자신의 역할이 전체 아키텍처에서 어디에 위치하는가?</summary>

이것은 각자 답해야 하는 질문이다. 확인할 것:
- 내 컴포넌트의 **입력**은 무엇인가? (누가 나에게 데이터를 전달하는가?)
- 내 컴포넌트의 **출력**은 무엇인가? (내가 만든 결과를 누가 사용하는가?)
- 내 컴포넌트의 품질이 전체 시스템에 어떤 영향을 주는가?
- 내 컴포넌트에 문제가 생기면 어떤 증상이 나타나는가?

이 4가지를 명확히 답할 수 있으면, 전체 아키텍처에서 자신의 위치를 이해한 것이다.

</details>

---

## 다음으로 읽을 자료
- [사전 과제](/pre-assignment) — 학습한 모든 개념을 종합하여 직접 RAG와 GraphRAG를 구현하고 비교하는 실습 과제를 진행한다.
