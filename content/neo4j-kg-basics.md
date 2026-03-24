---
title: "Neo4j & Knowledge Graph 기초"
description: "그래프 데이터베이스의 원리, 노드/엣지/속성, Cypher 쿼리 기초. ATHENA가 Neo4j를 선택한 이유."
sources:
  - type: official-docs
    label: "Neo4j 공식 문서"
    url: "https://neo4j.com/docs/"
  - type: official-docs
    label: "Neo4j GraphAcademy"
    url: "https://graphacademy.neo4j.com/"
  - type: github
    label: "neo4j/neo4j (13k+ stars)"
    url: "https://github.com/neo4j/neo4j"
youtube:
  - "T6L9EoBy8zQ"
---

> **25분 읽기** | 핵심: 관계 추적이 본질인 문제에는 그래프 DB가 정답이다.
> Phase 3 (KG & GraphRAG)의 1번째 모듈. 이전: [GraphRAG 개념](/study/graphrag-concepts) → 다음: [ATHENA 아키텍처 딥다이브](/study/athena-architecture)

## ATHENA 프로젝트와의 연결

ATHENA v2의 심장은 Neo4j 위에 구축된 Knowledge Graph다. 의사결정의 근거를 노드와 엣지로 구조화하고, "왜?" 질문에 그래프 경로를 따라 답하는 것 — 이것이 ATHENA가 그래프 DB를 필요로 하는 이유다.

## 왜 그래프인가?

비유하면 이렇다. 관계형 DB(표)는 **엑셀 스프레드시트**다. 행과 열로 깔끔하게 정리되어 있다. 그런데 이런 질문을 받으면?

> "왜 우리 팀이 ChromaDB 대신 Neo4j를 선택했는가?"

이 질문에 답하려면 **의사결정 테이블**에서 해당 행을 찾고, **근거 테이블**을 JOIN하고, 그 근거의 **출처 테이블**을 또 JOIN하고... 관계가 깊어질수록 JOIN이 중첩되고 쿼리는 느려진다.

<div class="compare-grid">
  <div class="compare-card">
    <div class="compare-title">관계형 DB (표)</div>
    <strong>의사결정 테이블</strong><br/>
    <code>SELECT * FROM decisions JOIN reasons ON ... JOIN sources ON ...</code><br/><br/>
    JOIN 3단계만 돼도 쿼리가 복잡해진다. 관계의 깊이가 커질수록 성능이 급격히 저하된다.
  </div>
  <div class="compare-card">
    <div class="compare-title">그래프 DB (관계)</div>
    <strong>노드 → 엣지 → 노드</strong><br/>
    <code>MATCH (d)-[:근거]->(r)-[:출처]->(s) RETURN d,r,s</code><br/><br/>
    관계를 따라가면 끝. 깊이가 깊어져도 자연스럽다.
  </div>
</div>

핵심은 이것이다: **ATHENA의 핵심 질문 "왜?"는 인과 관계 추적이고, 인과 관계 추적은 본질적으로 그래프 탐색이다.**

## 그래프 DB 기본 개념

그래프 DB의 구성 요소는 4가지뿐이다.

<div class="diagram-box">
  <div class="diagram-title">그래프 DB의 4가지 구성 요소</div>
  <div class="pipe-step">
    <div class="pipe-num">1</div>
    <div class="pipe-content"><strong>노드(Node)</strong> = 개체<br/>사람, 기술, 문서, 의사결정 등 "것"에 해당하는 모든 것</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">2</div>
    <div class="pipe-content"><strong>엣지(Relationship)</strong> = 관계<br/>노드 사이의 연결. "도입했다", "대체했다", "근거로_삼았다" 등</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">3</div>
    <div class="pipe-content"><strong>속성(Property)</strong> = 메타데이터<br/>노드나 엣지에 붙는 키-값 쌍. 날짜, 이유, 출처 등</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">4</div>
    <div class="pipe-content"><strong>라벨(Label)</strong> = 노드의 종류<br/>Person, Technology, Decision 등 노드를 분류하는 태그</div>
  </div>
</div>

ATHENA 프로젝트로 예를 들면:

<div class="info-card">
  <div class="info-card-title">ATHENA Knowledge Graph 예시</div>
  <span class="kw">Decision</span> 노드: "벡터 DB를 Neo4j로 교체"<br/>
  → <em>근거로_삼았다</em> → <span class="kw">Reason</span> 노드: "인과 관계 추적 필요"<br/>
  → <em>출처</em> → <span class="kw">Document</span> 노드: "M1 회의록 2026-04-03"<br/><br/>
  <strong>속성 예시:</strong><br/>
  Decision 노드의 속성: <code>{ date: "2026-04-03", decided_by: "팀 전체", confidence: "high" }</code><br/>
  근거로_삼았다 엣지의 속성: <code>{ weight: 0.9, category: "기술적" }</code>
</div>

이렇게 하면 "왜 Neo4j를 선택했는가?"라는 질문에 Decision 노드에서 출발해 엣지를 따라가며 근거 → 출처까지 추적할 수 있다.

## Cypher 쿼리 기초

Cypher는 Neo4j의 쿼리 언어다. SQL이 관계형 DB의 언어라면, Cypher는 그래프 DB의 언어다. 핵심은 **패턴 매칭** — 그래프에서 특정 패턴을 찾는 것이다.

### 기본 문법

```cypher
-- 노드는 괄호 (), 관계는 화살표 -[]->
-- 라벨은 콜론 뒤에, 속성은 중괄호 안에

-- 노드 생성
CREATE (d:Decision {title: "Neo4j 도입", date: "2026-04-03"})

-- 관계 생성
CREATE (d)-[:근거로_삼았다 {weight: 0.9}]->(r)

-- 패턴 매칭으로 조회
MATCH (d:Decision) RETURN d
```

### ATHENA 데이터로 실습

**예시 1: 모든 의사결정 노드 조회**

```cypher
MATCH (d:Decision)
RETURN d.title, d.date
ORDER BY d.date DESC
```

**예시 2: 특정 기술의 도입 근거 추적**

```cypher
MATCH (d:Decision)-[:근거로_삼았다]->(r:Reason)
WHERE d.title CONTAINS "Neo4j"
RETURN d.title, r.content
```

이것이 SQL로는 복잡한 JOIN이 필요한 쿼리가 Cypher에서는 직관적으로 표현되는 예시다.

**예시 3: 2단계 인과 사슬 탐색**

```cypher
MATCH (d:Decision)-[:근거로_삼았다]->(r:Reason)-[:출처]->(doc:Document)
WHERE d.title CONTAINS "Neo4j"
RETURN d.title AS 의사결정,
       r.content AS 근거,
       doc.title AS 출처문서
```

<div class="callout callout-amber">
  <strong>Cypher의 패턴 매칭 직관</strong><br/>
  <code>(A)-[:관계]->(B)</code>를 읽는 법: "A에서 출발해서 '관계'를 따라 B에 도달"<br/>
  화살표 방향이 관계의 방향이다. <code>(A)<-[:관계]-(B)</code>는 반대 방향.<br/>
  관계 깊이를 늘리려면 체이닝: <code>(A)-[:r1]->(B)-[:r2]->(C)</code><br/>
  가변 깊이도 가능: <code>(A)-[:관계*1..3]->(B)</code>는 1~3단계 사이의 모든 경로를 탐색한다.
</div>

## 벡터 인덱스와 그래프의 결합

Neo4j 5.x부터 **벡터 인덱스**를 내장 지원한다. 이것이 ATHENA에 중요한 이유는:

<div class="compare-grid">
  <div class="compare-card">
    <div class="compare-title">벡터 검색만 (기본 RAG)</div>
    "인과 관계" → 의미적으로 유사한 청크 k개 반환<br/><br/>
    <strong>한계:</strong> 유사한 <em>텍스트</em>는 찾지만, 실제 인과 <em>관계</em>는 모른다.
  </div>
  <div class="compare-card">
    <div class="compare-title">벡터 + 그래프 (ATHENA v2)</div>
    "인과 관계" → 벡터 검색으로 관련 노드 진입 → 그래프 탐색으로 인과 사슬 추적<br/><br/>
    <strong>장점:</strong> 의미적 유사도로 <em>시작점</em>을 찾고, 그래프로 <em>관계</em>를 따라간다.
  </div>
</div>

Neo4j에서 벡터 인덱스를 만들면 이런 쿼리가 가능해진다:

```cypher
-- 벡터 유사도로 가장 관련 있는 Decision 노드를 찾고
-- 그 노드에서 그래프 탐색으로 인과 사슬을 추적
CALL db.index.vector.queryNodes('decision_embeddings', 3, $queryVector)
YIELD node AS decision, score
MATCH (decision)-[:근거로_삼았다]->(reason)-[:출처]->(doc)
RETURN decision.title, reason.content, doc.title, score
ORDER BY score DESC
```

이것이 바로 GraphRAG의 기반이다 — 벡터 검색(의미 유사도)과 그래프 탐색(관계 추적)의 결합.

## ATHENA가 Neo4j를 선택한 이유

여러 선택지가 있었다. 왜 Neo4j인가?

| 선택지 | 검토 결과 |
|--------|-----------|
| **NetworkX** (Python 라이브러리) | 메모리 내 그래프 → 데이터가 커지면 한계. 영속성 없음. |
| **Amazon Neptune** | 관리형 서비스지만 비용이 높고, 로컬 개발 불가. 학생 프로젝트에 부적합. |
| **ArangoDB** | 멀티모델 DB. 그래프 전용이 아니라 Cypher만큼의 직관적 쿼리 언어가 없다. |
| **Neo4j** | 그래프 DB 1위. 벡터 인덱스 내장. Python 드라이버 완비. 무료 Community Edition. |

<div class="callout callout-amber">
  <strong>ATHENA가 Neo4j를 선택한 4가지 이유</strong><br/>
  <strong>1. 인과 관계 추적이 핵심:</strong> "왜?" 질문 = 그래프 탐색. 그래프 DB가 필연적 선택.<br/>
  <strong>2. Python 생태계 지원:</strong> <code>neo4j</code> Python 드라이버가 성숙하고, LangChain과도 통합된다.<br/>
  <strong>3. 벡터 인덱스 내장:</strong> 별도 벡터 DB(ChromaDB 등) 없이도 벡터 검색 + 그래프 탐색을 하나의 DB에서 처리한다.<br/>
  <strong>4. 커뮤니티와 문서화:</strong> GraphAcademy 무료 강좌, 13k+ GitHub stars, 풍부한 한국어 자료까지.
</div>

## 체크포인트

Neo4j와 Knowledge Graph의 기본을 이해했는지 확인하자.

<details>
<summary>Q1. 관계형 DB 대비 그래프 DB의 핵심 장점은?</summary>

관계(relationship)를 따라가는 탐색이 본질적으로 빠르고 직관적이다. 관계형 DB에서 N단계 관계를 추적하려면 N번의 JOIN이 필요하고, 깊이가 깊어질수록 성능이 급격히 저하된다. 그래프 DB에서는 엣지를 따라가기만 하면 되므로 깊이에 관계없이 일정한 성능을 유지한다. ATHENA처럼 "왜?"라는 인과 사슬을 추적하는 문제에서 이 차이가 결정적이다.

</details>

<details>
<summary>Q2. Cypher에서 2단계 관계를 탐색하는 패턴은?</summary>

```cypher
MATCH (a)-[:관계1]->(b)-[:관계2]->(c)
RETURN a, b, c
```

노드-관계-노드를 체이닝하면 된다. 가변 깊이가 필요하면 `(a)-[:관계*1..3]->(b)` 패턴으로 1~3단계 사이의 모든 경로를 한 번에 탐색할 수 있다.

</details>

<details>
<summary>Q3. ATHENA에서 벡터 검색과 그래프 탐색이 어떻게 결합되는가?</summary>

두 단계로 작동한다:
1. **벡터 검색**: 사용자 질문을 임베딩하고, Neo4j의 벡터 인덱스에서 의미적으로 가장 유사한 노드를 찾는다. 이것이 탐색의 **시작점**이 된다.
2. **그래프 탐색**: 그 시작점에서 엣지(관계)를 따라 인과 사슬을 추적한다. "왜?" 질문이 근거 → 출처 → 관련 결정으로 이어지는 경로를 탐색한다.

벡터 검색이 "어디서 시작할지"를, 그래프 탐색이 "어디로 따라갈지"를 담당한다.

</details>

---

## 다음으로 읽을 자료
- [ATHENA 아키텍처 딥다이브](/study/athena-architecture) — Neo4j 위에 구축된 ATHENA 시스템의 전체 구조, 데이터 흐름, 설계 결정의 근거를 파악한다.
