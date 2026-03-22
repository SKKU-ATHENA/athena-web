---
title: "벡터 DB 비교"
description: "ChromaDB, FAISS, Qdrant 등 특성과 트레이드오프"
sources:
  - type: github
    label: "chroma-core/chroma (26k+ stars)"
    url: "https://github.com/chroma-core/chroma"
  - type: github
    label: "facebookresearch/faiss (39k+ stars)"
    url: "https://github.com/facebookresearch/faiss"
  - type: github
    label: "qdrant/qdrant (29k+ stars)"
    url: "https://github.com/qdrant/qdrant"
  - type: official-docs
    label: "ChromaDB 공식 문서"
    url: "https://docs.trychroma.com/"
youtube:
  - "klTvEwg3oJ4"
---

> **4분 읽기** | 핵심: 임베딩 벡터를 저장하고 빠르게 검색하는 벡터 DB 3종 비교.
> 6개 학습 자료 중 3번째. 권장 순서: 환경 세팅 → 임베딩 → 벡터 DB → RAG 아키텍처 → LLM 선택 → GraphRAG

## 벡터 DB란?

임베딩 벡터를 **저장**하고, 주어진 쿼리 벡터와 가장 **유사한** 벡터를 빠르게 찾아주는 데이터베이스. RAG에서 "검색" 단계의 핵심 인프라.

## 왜 일반 DB로는 안 되나?

일반 DB(MySQL, PostgreSQL)는 정확한 매칭(`WHERE name = 'AI'`)에 최적화되어 있다. 벡터 유사도 검색은 **근사 최근접 이웃(ANN)** 알고리즘이 필요하고, 이를 위한 특수 인덱스 구조가 필요하다.

### ANN (Approximate Nearest Neighbor)이란?

수백만 개의 벡터 중에서 가장 유사한 것을 찾으려면, 모든 벡터를 하나하나 비교하는 것은 너무 느리다. ANN은 **정확도를 약간 희생하는 대신, 검색 속도를 극적으로 높이는** 알고리즘이다. 예를 들어 100만 개 벡터에서 정확한 검색이 1초 걸린다면, ANN은 0.001초 만에 거의 동일한 결과를 찾아낸다. 벡터 DB들은 다양한 ANN 인덱스 방식을 사용하며, 각각 속도-정확도 트레이드오프가 다르다.

## 주요 벡터 DB 비교

| 특성 | ChromaDB | FAISS | Qdrant |
|------|----------|-------|--------|
| **언어** | Python | C++ (Python 바인딩) | Rust |
| **설치 난이도** | 매우 쉬움 (`pip install`) | 쉬움 | 보통 (Docker 권장) |
| **메모리 모드** | 지원 (기본) | 지원 | 지원 |
| **디스크 저장** | 지원 | 제한적 | 지원 |
| **메타데이터 필터** | 지원 | 미지원 | 강력 지원 |
| **규모** | 소~중 | 대규모 (수십억) | 중~대 |
| **API** | 심플 | 저수준 | REST/gRPC |
| **최적 용도** | 프로토타입, 학습 | 대규모 프로덕션 | 프로덕션 |

## ChromaDB

가장 쉽고 빠르게 시작할 수 있다. 사전 과제 추천 도구.

```python
import chromadb

# 인메모리 클라이언트 (가장 간단)
client = chromadb.Client()

# 또는 영구 저장
client = chromadb.PersistentClient(path="./chroma_db")

# 컬렉션 생성
collection = client.create_collection(
    name="my_documents",
    metadata={"hnsw:space": "cosine"},  # 코사인 유사도 사용
)

# 문서 추가 (자동 임베딩)
collection.add(
    documents=["인공지능의 역사", "딥러닝 혁명", "트랜스포머 아키텍처"],
    ids=["doc1", "doc2", "doc3"],
)

# 검색
results = collection.query(query_texts=["AI 발전"], n_results=2)
print(results["documents"])
```

**장점**: 임베딩을 자동으로 해주므로 별도 임베딩 코드가 불필요.
**단점**: 대규모 데이터(100만+)에서는 성능 한계.

## FAISS (Facebook AI Similarity Search)

Meta(Facebook)에서 만든 초대규모 벡터 검색 라이브러리. 수십억 벡터까지 처리 가능.

> ℹ️ FAISS와 Qdrant는 참고용이다. 사전 과제에서는 ChromaDB만 사용해도 충분하다.

```python
import faiss
import numpy as np

# 벡터 차원
d = 384
# 인덱스 생성
index = faiss.IndexFlatL2(d)  # L2 (유클리드) 거리

# 벡터 추가
vectors = np.random.random((1000, d)).astype("float32")
index.add(vectors)

# 검색
query = np.random.random((1, d)).astype("float32")
distances, indices = index.search(query, k=5)
print(f"가장 가까운 5개: {indices}")
```

**장점**: 속도와 확장성이 압도적. GPU 가속 지원.
**단점**: 메타데이터 필터가 없어서 별도 관리 필요. 저수준 API.

## Qdrant

Rust로 작성된 고성능 벡터 DB. 프로덕션 용도에 적합.

```python
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

client = QdrantClient(":memory:")  # 인메모리

client.create_collection(
    collection_name="docs",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
)

# 벡터 + 메타데이터 추가
client.upsert(
    collection_name="docs",
    points=[
        PointStruct(id=1, vector=[0.1]*384, payload={"text": "인공지능"}),
        PointStruct(id=2, vector=[0.2]*384, payload={"text": "딥러닝"}),
    ],
)
```

**장점**: 강력한 필터링, REST API, 프로덕션 안정성.
**단점**: Docker 설치가 필요하고 학습 곡선이 있다.

## 어떤 걸 고를까?

```
학습/프로토타입 → ChromaDB
대규모 프로덕션 → FAISS 또는 Qdrant
메타데이터 필터 필요 → Qdrant 또는 ChromaDB
GPU 활용 → FAISS
```

사전 과제에서는 **본인이 직접 조사**하고 선택 근거를 정리해야 한다. 위 비교표를 참고하되 자신의 판단으로 결정할 것.

> 💡 **사전 과제 추천**: ChromaDB를 사용하자. 설치가 가장 간단하고, 코드 몇 줄로 바로 시작할 수 있다. 도구 선택 보고서에서 다른 옵션과 비교 근거를 작성하면 된다.

---

## 다음으로 읽을 자료
- [RAG 아키텍처 해부](/study/rag-architecture) — 벡터 DB가 RAG 파이프라인에서 어떤 역할을 하는지 전체 구조를 파악한다.
- [LLM 선택지 정리](/study/llm-options) — RAG의 생성 단계에서 사용할 LLM의 종류와 비용을 비교한다.
