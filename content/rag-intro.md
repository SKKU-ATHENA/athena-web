---
title: "RAG란 무엇인가"
description: "LLM만으로는 왜 부족한가? 외부 지식을 검색하여 LLM을 보강하는 RAG의 핵심 아이디어."
sources:
  - type: paper
    label: "RAG 원본 논문 (Lewis et al., 2020)"
    url: "https://arxiv.org/abs/2005.11401"
  - type: official-docs
    label: "Pinecone RAG 가이드"
    url: "https://www.pinecone.io/learn/retrieval-augmented-generation/"
youtube:
  - "T-D1OfcDW1M"
---

> **15분 읽기** | 핵심: LLM의 근본적 한계를 이해하고, 외부 지식 검색으로 이를 보완하는 RAG의 핵심 아이디어를 잡는다.
> Phase 1 (AI/LLM 기초)에서 Phase 2 (RAG 핵심)로 넘어가는 브릿지 모듈. 이전: [Transformer & LLM](/study/transformer-llm) → 다음: [RAG 아키텍처 해부](/study/rag-architecture)

## LLM에게 물어보자

ChatGPT에게 이런 질문을 해보자.

> "지난주 우리 팀 회의에서 뭘 결정했지?"

답변: *"죄송하지만, 저는 귀하의 팀 회의에 대한 정보를 가지고 있지 않습니다."*

한 번 더.

> "ATHENA 프로젝트의 M1 마일스톤 목표는?"

답변: *"ATHENA 프로젝트에 대한 구체적인 정보를 찾을 수 없습니다."*

당연하다. LLM은 인터넷의 공개 텍스트로 학습했지, **우리 팀의 내부 문서를 본 적이 없다**. 그렇다면 이런 질문에 답하려면 무엇이 필요한가?

## LLM의 3가지 근본적 한계

Phase 1에서 Transformer와 LLM의 작동 원리를 배웠다. LLM은 방대한 텍스트 데이터로 학습하여 "다음 토큰을 예측"하는 모델이다. 이 구조에서 오는 근본적인 한계가 3가지 있다.

### 1. 지식 커트오프

LLM은 학습이 끝난 시점 이후의 정보를 모른다.

<div class="compare-grid">
  <div class="compare-item compare-before">
    <div class="compare-label">질문</div>
    "2026년 3월에 발표된 논문 X의 핵심 기여는?"
  </div>
  <div class="compare-item compare-after">
    <div class="compare-label">LLM 속마음</div>
    "내 학습 데이터에 그 논문은 없는데... 일단 그럴듯하게 답해볼까?"
  </div>
</div>

모델이 2024년 데이터까지 학습했다면, 2025년 이후의 사건은 **존재 자체를 모른다**.

### 2. 환각 (Hallucination)

LLM은 모를 때 "모른다"고 하지 않는다. 그럴듯하지만 **틀린 정보를 자신 있게 생성**한다.

```python
# 이런 일이 실제로 일어난다
질문 = "ATHENA 프로젝트의 기술 스택은?"

LLM_답변 = """
ATHENA 프로젝트는 Java Spring Boot를 백엔드로 사용하며,
프론트엔드는 React로 구성되어 있습니다.
데이터베이스는 PostgreSQL을 사용합니다.
"""
# 전부 틀렸다. Python + Neo4j + Chainlit인데.
```

환각이 위험한 이유는 **그럴듯하기 때문**이다. 검증 없이 믿으면 잘못된 결정을 내리게 된다.

### 3. 내부 문서 무지

LLM은 공개 인터넷 데이터로 학습했다. 다음은 원천적으로 모른다:
- 팀 회의록, 의사결정 기록
- 사내 설계 문서, API 스펙
- 비공개 연구 데이터

<div class="callout callout-amber">
  <strong>한 줄 요약</strong>
  LLM은 모든 교과서를 읽은 학생이지만, 우리 팀 회의에는 참석하지 않았다.
</div>

## 핵심 아이디어: "오픈북 시험"

학교에서 시험을 볼 때를 떠올려보자.

<div class="compare-grid">
  <div class="compare-item compare-before">
    <div class="compare-label">클로즈드북 시험</div>
    오직 머릿속 기억에만 의존한다. 외운 내용이 아니면 답할 수 없다. 기억이 애매하면 "아마 이거였던 것 같은데..."하고 찍는다.
  </div>
  <div class="compare-item compare-after">
    <div class="compare-label">오픈북 시험</div>
    교과서를 펼쳐두고 본다. 관련 내용을 찾아서 읽고 답한다. 정확도가 훨씬 높다.
  </div>
</div>

일반 LLM은 **클로즈드북 시험**을 보는 것과 같다. 학습 데이터라는 "기억"에만 의존하고, 기억에 없으면 환각을 일으킨다.

RAG는 이 LLM에게 **오픈북 시험**을 보게 하는 것이다.

> 관련 자료를 찾아서 건네주고 "이걸 보고 답해"라고 한다.

이것이 RAG의 전부다.

**RAG** = <span class="kw">Retrieval</span>-<span class="kw">Augmented</span> <span class="kw">Generation</span>

- **Retrieval** (검색): 질문과 관련된 문서 조각을 찾는다
- **Augmented** (보강): 찾은 자료를 LLM의 입력에 추가한다
- **Generation** (생성): LLM이 자료를 참고하여 답변을 생성한다

```python
# RAG의 본질을 코드 한 줄로 표현하면
답변 = LLM(질문 + 검색된_관련_자료)
```

## RAG의 전체 흐름 한눈에

RAG는 두 단계로 나뉜다: **사전 준비**(문서를 검색 가능하게 만들기)와 **질문 응답**(실제로 검색해서 답하기).

### 사전 준비 단계

도서관을 만드는 것과 같다. 책을 사서, 분류하고, 서가에 꽂아두는 작업이다.

<div class="diagram-box">
  <div class="diagram-title">사전 준비: 문서를 검색 가능하게 만들기</div>
  <div class="flow">
    <div class="flow-badge flow-badge-primary">문서들</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">조각내기 (청킹)</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">벡터 변환 (임베딩)</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">벡터 DB에 저장</div>
  </div>
</div>

| 단계 | 비유 | 하는 일 |
|------|------|---------|
| 문서들 | 구매한 책들 | 회의록, 설계 문서, 논문 등 원본 자료 |
| 조각내기 | 책을 챕터별로 분리 | 긴 문서를 적절한 크기의 조각(청크)으로 분할 |
| 벡터 변환 | 각 챕터에 분류 번호 부여 | Phase 1에서 배운 임베딩으로 각 조각을 숫자 벡터로 변환 |
| 저장 | 서가에 꽂기 | 벡터 DB에 저장하여 나중에 빠르게 검색 가능하게 함 |

### 질문 응답 단계

도서관에서 책을 찾아 읽고 답하는 과정이다.

<div class="diagram-box">
  <div class="diagram-title">질문 응답: 검색하고 답하기</div>
  <div class="pipe-step">
    <div class="pipe-num">1</div>
    <div class="pipe-content"><strong>사용자가 질문한다</strong><br/>"M1 마일스톤의 목표는?"</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">2</div>
    <div class="pipe-content"><strong>질문을 벡터로 변환한다</strong><br/>임베딩 모델이 질문의 의미를 숫자 벡터로 바꾼다</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">3</div>
    <div class="pipe-content"><strong>관련 조각을 검색한다</strong><br/>벡터 DB에서 질문과 의미가 비슷한 문서 조각 k개를 찾는다</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">4</div>
    <div class="pipe-content"><strong>LLM에게 전달한다</strong><br/>"이 자료를 참고해서 질문에 답해" + 검색 결과 + 질문</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">5</div>
    <div class="pipe-content"><strong>LLM이 답변을 생성한다</strong><br/>검색된 자료를 근거로 정확한 답변을 만든다</div>
  </div>
</div>

<details>
<summary>Q. RAG 없이 프롬프트에 문서를 통째로 넣으면 안 되나?</summary>

넣을 수 있다. 하지만 LLM의 컨텍스트 윈도우에는 한계가 있다 (GPT-4o는 128K 토큰, 약 한글 6만 자). 문서가 수백 페이지라면 다 넣을 수 없다. 또한 토큰 수에 비례해 비용이 증가한다. RAG는 "필요한 부분만 골라서 넣는 것"이므로, 비용도 줄이고 정확도도 높인다.
</details>

## ATHENA에서 RAG가 왜 중요한가

ATHENA의 목표를 다시 떠올려보자: **의사결정 근거를 Knowledge Graph로 구조화하여 "왜?" 질문에 인과 사슬로 응답하는 시스템**.

이 시스템이 답해야 하는 질문들:

- "Neo4j를 선택한 이유는?"
- "M1에서 PROTOv1을 개선하기로 한 근거는?"
- "임베딩 모델로 왜 이걸 골랐지?"

이 답은 **팀의 회의록, 설계 문서, 의사결정 기록**에 있다. LLM이 절대 알 수 없는 정보다.

<div class="diagram-box">
  <div class="diagram-title">ATHENA에서의 RAG 역할</div>
  <div class="pipe-step">
    <div class="pipe-num">1</div>
    <div class="pipe-content"><strong>팀 문서를 수집한다</strong><br/>회의록, 설계 문서, 의사결정 기록, Notion 페이지</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">2</div>
    <div class="pipe-content"><strong>RAG 파이프라인으로 검색 가능하게 만든다</strong><br/>청킹 → 임베딩 → 벡터 DB 저장</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">3</div>
    <div class="pipe-content"><strong>"왜?" 질문에 근거 기반으로 답한다</strong><br/>관련 문서를 검색하여 LLM에 제공 → 출처가 있는 답변 생성</div>
  </div>
</div>

하지만 기본 RAG에도 한계가 있다. 예를 들어:

- "A 결정이 B에 영향을 미친 이유는?" → 정보가 여러 문서에 **분산**되어 있으면 벡터 검색만으로는 연결고리를 찾기 어렵다
- "프로젝트 전체의 의사결정 흐름을 요약해줘" → **전역적 질문**에는 top-k 검색이 약하다

<div class="callout callout-amber">
  <strong>Phase 2 미리보기</strong>
  기본 RAG의 이런 한계를 극복하기 위해 <strong>Knowledge Graph + RAG = GraphRAG</strong>라는 접근이 있다. 문서 간의 관계를 그래프로 구조화하면 인과 추론이 가능해진다. 이것이 바로 ATHENA v2의 핵심이며, Phase 2에서 자세히 다룬다.
</div>

<details>
<summary>Q. 그러면 기본 RAG는 필요 없는 건가?</summary>

아니다. GraphRAG도 기본 RAG 위에 구축된다. 문서를 청크로 나누고, 임베딩하고, 검색하는 기본 파이프라인은 그대로 사용한다. 거기에 지식 그래프라는 구조를 얹는 것이다. 기초를 모르면 응용도 할 수 없다.
</details>

---

## 다음으로 읽을 자료
- [RAG 아키텍처 해부](/study/rag-architecture) — RAG 파이프라인의 각 단계(청킹, 임베딩, 검색, 생성)를 구체적으로 이해한다.
- 사전과제에서 기본 RAG를 직접 구현해본다 — 이론을 코드로 확인하는 것이 가장 빠른 학습 방법이다.
