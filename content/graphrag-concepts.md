---
title: "GraphRAG 개념"
description: "Microsoft GraphRAG 아키텍처, 엔티티 추출, 커뮤니티 탐지"
sources:
  - type: github
    label: "microsoft/graphrag (31k+ stars)"
    url: "https://github.com/microsoft/graphrag"
  - type: paper
    label: "From Local to Global (arXiv 2024)"
    url: "https://arxiv.org/abs/2404.16130"
  - type: official-docs
    label: "GraphRAG 공식 문서"
    url: "https://microsoft.github.io/graphrag/"
youtube:
  - "r09tJfON6kE"
---

> **25분 읽기** | 핵심: 기본 RAG의 한계를 지식 그래프로 극복하는 GraphRAG의 원리.
> 6개 학습 자료 중 6번째. 권장 순서: 환경 세팅 → 임베딩 → 벡터 DB → RAG 아키텍처 → LLM 선택 → GraphRAG

> 🎯 **이 문서의 목적**: GraphRAG가 뭔지 깊이 이해하는 것이 아니라, "기본 RAG에 이런 한계가 있고, GraphRAG는 이렇게 해결한다"를 감 잡는 것이다. 사전 과제 Part 3에서 직접 체험하면서 이해가 깊어진다.

## ATHENA 프로젝트와의 연결

ATHENA의 핵심 과제가 바로 이것이다 — **의사결정의 인과 사슬을 지식 그래프로 구조화**하여 "왜?" 질문에 답하는 것. 사전 과제에서 체험하는 RAG의 한계와 GraphRAG의 개선점이 M1 이후 v2 개발의 근거가 된다.

## 기본 RAG의 한계

기본 RAG는 **벡터 유사도**로 관련 청크를 찾는다. 이 방식은 단순 사실 확인에는 잘 작동하지만, 다음과 같은 질문에는 약하다:

- "전체 문서의 주요 주제를 요약해줘" (전역적 질문)
- "왜 A가 B를 대체했나?" (인과 관계)
- "A와 B의 관계는?" (엔티티 간 관계)

top-k 검색은 **지역적(local)** 정보만 가져오기 때문이다.

## GraphRAG란?

Microsoft Research에서 2024년에 발표한 접근법. 핵심 아이디어:

> 텍스트에서 **엔티티(개체)**와 **관계**를 추출하여 **지식 그래프**를 구축하고, 이 그래프 구조를 활용하여 검색과 답변 생성을 개선한다.

## 아키텍처 개요

<div class="diagram-box">
  <div class="diagram-title">GraphRAG 아키텍처</div>
  <div class="pipe-step">
    <div class="pipe-num">0</div>
    <div class="pipe-content"><strong>문서 텍스트</strong><br/>원본 데이터 입력</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">1</div>
    <div class="pipe-content"><strong>엔티티/관계 추출</strong><br/>LLM이 텍스트에서 개체와 관계를 식별</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">2</div>
    <div class="pipe-content"><strong>지식 그래프 구축</strong><br/>엔티티 → 노드, 관계 → 엣지</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">3</div>
    <div class="pipe-content"><strong>커뮤니티 탐지</strong><br/>Leiden 알고리즘으로 밀접 노드 그룹화</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">4</div>
    <div class="pipe-content"><strong>커뮤니티별 요약 생성</strong><br/>LLM이 각 커뮤니티의 요약을 작성</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">5</div>
    <div class="pipe-content"><strong>질의 시: 로컬 검색 + 글로벌 검색 결합</strong></div>
  </div>
</div>

## 핵심 단계

### 1. 엔티티/관계 추출

LLM을 사용하여 텍스트에서 개체(entity)와 관계(relationship)를 추출한다.

<div class="info-card">
  <div class="info-card-title">엔티티/관계 추출 예시</div>
  <strong>입력:</strong> "2012년 AlexNet이 ImageNet 대회에서 우승하며 딥러닝 혁명이 시작되었다."<br/><br/>
  <strong>추출된 엔티티:</strong> <span class="kw">AlexNet</span> (모델), <span class="kw">ImageNet</span> (대회), <span class="kw">딥러닝</span> (기술)<br/><br/>
  <strong>추출된 관계:</strong> AlexNet →<em>우승</em>→ ImageNet, AlexNet →<em>촉발</em>→ 딥러닝 혁명
</div>

### 2. 지식 그래프 구축

추출된 엔티티를 노드, 관계를 엣지로 구성한다.

<div class="diagram-box">
  <div class="diagram-title">지식 그래프 구조 예시</div>
  <div class="pipe-step">
    <div class="pipe-num">1</div>
    <div class="pipe-content"><span class="kw">AlexNet</span> ──<em>우승</em>──→ <span class="kw">ImageNet 2012</span></div>
  </div>
  <div class="pipe-arrow">↓ 촉발</div>
  <div class="pipe-step">
    <div class="pipe-num">2</div>
    <div class="pipe-content"><span class="kw">딥러닝 혁명</span></div>
  </div>
  <div class="pipe-arrow">↓ 발전</div>
  <div class="pipe-step">
    <div class="pipe-num">3</div>
    <div class="pipe-content"><span class="kw">트랜스포머</span></div>
  </div>
  <div class="pipe-arrow">↓ 기반</div>
  <div class="pipe-step">
    <div class="pipe-num">4</div>
    <div class="pipe-content"><span class="kw">GPT</span>, <span class="kw">BERT</span></div>
  </div>
</div>

### 3. 커뮤니티 탐지

Leiden 알고리즘으로 그래프를 **커뮤니티**(밀접하게 연결된 노드 그룹)로 분할한다.

> ℹ️ 지금 몰라도 된다: Leiden 알고리즘은 네트워크에서 밀접하게 연결된 노드 그룹(커뮤니티)을 자동으로 찾아내는 방법이다. 소셜 네트워크에서 친구 그룹을 자동 감지하는 것과 비슷한 원리. 같은 문서에서 자주 함께 언급되는 개념들끼리 자동으로 묶인다.

<div class="callout callout-amber">
  <strong>커뮤니티 탐지 예시</strong><br/>
  <strong>커뮤니티 A:</strong> <span class="kw">AlexNet</span> <span class="kw">ImageNet</span> <span class="kw">CNN</span> <span class="kw">딥러닝 혁명</span><br/>
  <strong>커뮤니티 B:</strong> <span class="kw">트랜스포머</span> <span class="kw">Attention</span> <span class="kw">BERT</span> <span class="kw">GPT</span><br/>
  <strong>커뮤니티 C:</strong> <span class="kw">RAG</span> <span class="kw">벡터DB</span> <span class="kw">임베딩</span> <span class="kw">검색</span>
</div>

### 4. 커뮤니티 요약

각 커뮤니티에 대해 LLM이 **요약**을 생성한다. 이 요약이 글로벌 질문에 대한 답변의 기반이 된다.

## 두 가지 검색 모드

### Local Search (로컬 검색)
- 기본 RAG와 유사하게 특정 엔티티 주변을 탐색
- "AlexNet은 몇 년에 발표되었나?" 같은 구체적 질문에 적합

### Global Search (글로벌 검색)
- 커뮤니티 요약을 활용하여 전체적 관점 제공
- "AI 발전의 주요 흐름은?" 같은 포괄적 질문에 적합
- 기본 RAG에서 불가능했던 질문에 답할 수 있다

## 기본 RAG vs GraphRAG

| 측면 | 기본 RAG | GraphRAG |
|------|---------|----------|
| **전역 요약** | 불가능 | 커뮤니티 요약으로 가능 |
| **인과 추론** | 약함 | 그래프 경로로 추론 가능 |
| **비용** | 낮음 | 높음 (인덱싱에 LLM 호출 필요) |
| **정확도 (사실 확인)** | 우수 | 우수 |

## 사전 과제 Part 3에서 할 일

1. 같은 데이터에 Microsoft GraphRAG를 실행한다
2. Part 2에서 기본 RAG가 실패한 질문을 GraphRAG에 던진다
3. 두 결과를 나란히 비교한다
4. GraphRAG가 더 나은 답변을 제공한 이유를 그래프 구조 관점에서 분석한다

## 체크포인트

GraphRAG는 ATHENA의 핵심 접근법이다. 아래 질문에 답할 수 있는지 확인하자.

<details>
<summary>Q1. 기본 RAG가 잘 답하지 못하는 질문 유형 3가지는?</summary>

1. **전역적 질문**: "전체 문서의 주요 주제를 요약해줘" — top-k 검색으로는 전체를 볼 수 없다
2. **인과 관계**: "왜 A가 B를 대체했나?" — 인과 정보가 여러 곳에 분산되어 있다
3. **엔티티 간 관계**: "A와 B의 관계는?" — 단순 유사도 검색으로는 관계를 추론하기 어렵다

</details>

<details>
<summary>Q2. GraphRAG에서 "엔티티 추출"과 "관계 추출"이란?</summary>

LLM이 텍스트를 읽고, 그 안에서 핵심 개체(사람, 기술, 사건 등)를 **엔티티**로, 개체들 사이의 연결(촉발, 대체, 기반 등)을 **관계**로 식별하는 과정이다. 이것이 지식 그래프의 노드와 엣지가 된다.

</details>

<details>
<summary>Q3. 로컬 검색과 글로벌 검색의 차이는?</summary>

- **로컬 검색**: 특정 엔티티 주변을 탐색하여 구체적 사실 질문에 답한다 ("AlexNet은 몇 년에 발표되었나?")
- **글로벌 검색**: 커뮤니티 요약을 활용하여 전체적 관점의 질문에 답한다 ("AI 발전의 주요 흐름은?")

</details>

<details>
<summary>Q4. GraphRAG의 가장 큰 단점은? 왜 기본 RAG보다 비용이 높은가?</summary>

인덱싱 단계에서 모든 텍스트에 대해 LLM을 호출하여 엔티티/관계를 추출하고 커뮤니티 요약을 생성해야 한다. 기본 RAG는 임베딩만 계산하면 되지만, GraphRAG는 LLM 호출이 추가되므로 **인덱싱 비용과 시간이 크게 증가**한다.

</details>

---

## 다음으로 읽을 자료
- [사전 과제](/pre-assignment) — 학습한 내용을 종합하여 직접 RAG와 GraphRAG를 구현하고 비교하는 실습 과제를 진행한다.
