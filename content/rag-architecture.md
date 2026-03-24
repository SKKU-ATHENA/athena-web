---
title: "RAG 아키텍처 해부"
description: "전체 RAG 파이프라인 개념도와 각 단계의 역할"
sources:
  - type: github
    label: "langchain-ai/langchain (131k+ stars)"
    url: "https://github.com/langchain-ai/langchain"
  - type: paper
    label: "RAG 원본 논문 (Lewis et al., 2020)"
    url: "https://arxiv.org/abs/2005.11401"
  - type: official-docs
    label: "LangChain RAG Tutorial"
    url: "https://python.langchain.com/docs/tutorials/rag"
youtube:
  - "T-D1OfcDW1M"
---

> **20분 읽기** | 핵심: 외부 지식을 검색해서 LLM에 넣어주는 RAG 파이프라인의 전체 구조.
> 6개 학습 자료 중 4번째. 권장 순서: 환경 세팅 → 임베딩 → 벡터 DB → RAG 아키텍처 → LLM 선택 → GraphRAG

## RAG란?

**Retrieval-Augmented Generation** — 검색으로 보강된 생성. LLM이 답변을 생성할 때, 외부 지식을 검색해서 컨텍스트로 제공하는 기법.

2020년 Meta(Facebook) AI Research에서 발표한 논문에서 처음 제안되었다.

## 왜 필요한가?

비유하면 이렇다. LLM은 **모든 교과서를 읽은 학생**이다. 일반 상식 질문에는 잘 답하지만, "지난주 우리 팀 회의에서 뭘 결정했지?"라고 물으면 모른다 — 그 학생이 그 회의에 참석한 적이 없기 때문이다. RAG는 이 학생에게 **회의록을 건네주면서 "이걸 보고 답해"**라고 하는 것이다.

LLM의 근본적 한계:

1. **지식 커트오프**: 학습 데이터 이후의 정보를 모른다
2. **환각 (Hallucination)**: 그럴듯하지만 틀린 정보를 생성한다
3. **도메인 지식 부재**: 조직 내부 문서, 전문 분야 지식이 없다

RAG는 이 문제를 **"필요한 정보를 찾아서 넣어주기"**로 해결한다.

## 전체 파이프라인

<div class="diagram-box">
  <div class="diagram-title">사전 준비 단계 (인덱싱)</div>
  <div class="flow">
    <div class="flow-badge flow-badge-primary">문서들</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">청킹</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">임베딩</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">벡터 저장소에 저장</div>
  </div>
</div>

<div class="diagram-box">
  <div class="diagram-title">질문 응답 단계 (질의)</div>
  <div class="pipe-step">
    <div class="pipe-num">1</div>
    <div class="pipe-content"><strong>사용자 질문</strong></div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">2</div>
    <div class="pipe-content"><strong>질문 임베딩</strong></div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">3</div>
    <div class="pipe-content"><strong>벡터 저장소에서 유사 청크 k개 검색</strong></div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">4</div>
    <div class="pipe-content"><strong>프롬프트 조합</strong><br/>시스템 프롬프트 + 검색 결과 + 질문</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">5</div>
    <div class="pipe-content"><strong>LLM이 답변 생성</strong></div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">6</div>
    <div class="pipe-content"><strong>사용자에게 답변 반환</strong></div>
  </div>
</div>

## 각 단계의 역할

### 1. 청킹 (Chunking)

문서를 적절한 크기의 조각으로 분할한다.

- **너무 크면**: 관련 없는 내용이 함께 검색됨 (노이즈)
- **너무 작으면**: 맥락이 사라짐 (정보 손실)
- **적절한 크기**: 보통 200~500자, 의미 단위로 분할이 이상적

### 2. 임베딩 (Embedding)

각 청크를 벡터로 변환한다. 이 벡터가 의미를 숫자로 표현한다.

### 3. 벡터 저장소 (Vector Store)

임베딩된 벡터를 저장하고, ANN(Approximate Nearest Neighbor) 인덱스를 구축한다.

### 4. 검색 (Retrieval)

사용자 질문을 임베딩하고, 벡터 저장소에서 가장 유사한 청크 k개를 가져온다.

**k값의 트레이드오프**:
- k가 작으면 → 정보 부족, 빠른 응답
- k가 크면 → 풍부한 컨텍스트, 노이즈 증가, 느린 응답
- LLM의 컨텍스트 윈도우 한계도 고려해야 함

### 5. 생성 (Generation)

검색된 청크를 LLM의 프롬프트에 넣어 답변을 생성한다.

```python
prompt = f"""다음 자료를 참고하여 질문에 답변하세요.
자료에 없는 내용은 "자료에서 확인할 수 없습니다"라고 답하세요.

[참고 자료]
{retrieved_chunks}

[질문]
{user_question}
"""
```

## 고급 기법 (Advanced RAG)

> ℹ️ 이 섹션은 심화 내용이다. 사전 과제에서는 기본 RAG만 구현하면 되므로 지금 몰라도 괜찮다.

기본 RAG의 성능을 높이기 위한 기법들이 있다:

- **Reranking**: 초기 검색 결과를 재순위 매겨 정확도를 높인다. (ℹ️ 지금 몰라도 된다: Cross-Encoder라는 모델을 사용한다.) 검색 k=20 → 리랭킹 후 상위 5개만 사용.
- **Hybrid Search**: 벡터 검색(의미)과 키워드 검색(BM25)을 결합하여 두 방식의 장점을 취한다.
- **Query Transformation**: 사용자 질문을 여러 변형으로 바꿔서 검색 범위를 넓힌다 (HyDE, Multi-Query 등).

> 💡 이런 기법들로도 해결되지 않는 근본적 한계(인과 추론, 전체 요약)가 GraphRAG를 필요로 하는 이유다.

## RAG의 한계

### 1. 청크 경계 문제
정보가 두 청크에 걸쳐 있으면 하나의 청크만으로는 완전한 답변을 만들 수 없다. 예: '서울의 인구는 약 960만명이다'라는 문장이 두 청크 사이에서 잘리면, 어느 쪽 청크만으로는 완전한 정보를 얻을 수 없다.

### 2. 전역적 질문
"전체 문서의 주요 주제는?" 같은 질문은 top-k 검색으로는 답할 수 없다. 전체를 봐야 한다.

### 3. 관계 추론
"A가 B를 대체한 이유는?"과 같은 인과 관계 질문은 관련 정보가 여러 곳에 분산되어 있을 수 있다.

### 4. 최신성
벡터 저장소의 데이터가 오래되면 답변도 오래된 정보를 기반으로 한다.

이러한 한계를 극복하기 위해 **GraphRAG** 같은 접근이 등장했다. → [GraphRAG 개념](/study/graphrag-concepts) 참고

---

## 다음으로 읽을 자료
- [LLM 선택지 정리](/study/llm-options) — RAG의 생성 단계에서 사용할 클라우드 및 로컬 LLM의 종류와 비용을 비교한다.
- [GraphRAG 개념](/study/graphrag-concepts) — 기본 RAG의 한계를 극복하는 지식 그래프 기반 접근법을 알아본다.
