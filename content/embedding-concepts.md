---
title: "임베딩이란?"
description: "벡터 공간, 코사인 유사도, 의미 기반 검색의 원리"
sources:
  - type: github
    label: "sentence-transformers (18k+ stars)"
    url: "https://github.com/UKPLab/sentence-transformers"
  - type: official-docs
    label: "OpenAI Embeddings Guide"
    url: "https://platform.openai.com/docs/guides/embeddings"
  - type: paper
    label: "Sentence-BERT (EMNLP 2019)"
    url: "https://arxiv.org/abs/1908.10084"
youtube:
  - "viZrOnJclY0"
---

## 임베딩이 뭔가?

텍스트를 **고정 길이의 숫자 벡터**(실수 배열)로 변환하는 것. 이 벡터는 텍스트의 **의미**를 수치적으로 표현한다.

```
"인공지능" → [0.12, -0.34, 0.56, ..., 0.78]  (768차원)
"AI"       → [0.13, -0.33, 0.55, ..., 0.77]  (매우 유사!)
"냉장고"   → [0.91, 0.22, -0.44, ..., 0.11]  (매우 다름)
```

## 핵심 용어

- **벡터(vector)**: 숫자들의 배열(리스트). 임베딩에서는 텍스트의 의미를 표현하는 숫자 목록을 말한다. 예: `[0.12, -0.34, 0.56]`.
- **차원(dimension)**: 벡터에 포함된 숫자의 개수. 384차원이면 숫자 384개로 의미를 표현한다는 뜻이다. 차원이 높을수록 더 세밀한 의미를 담을 수 있지만, 그만큼 계산과 저장 비용이 증가한다.
- **유사도(similarity)**: 두 벡터가 얼마나 비슷한지를 나타내는 수치. 값이 1에 가까우면 의미가 비슷하고, 0에 가까우면 관련이 없다는 뜻이다.

## 왜 필요한가?

컴퓨터는 텍스트를 직접 비교할 수 없다. "인공지능"과 "AI"는 글자가 완전히 다르지만 의미는 같다. 임베딩은 이 **의미적 유사성**을 숫자로 포착한다.

## 코사인 유사도

두 벡터 사이의 각도로 유사성을 측정한다. -1(정반대)부터 1(동일)까지.

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

- 유사도 ≈ 1.0: 거의 같은 의미
- 유사도 ≈ 0.0: 관련 없음
- 유사도 < 0: 반대 의미 (드물게 발생)

## 임베딩 모델 종류

### 오픈소스 (로컬 실행 가능)

| 모델 | 차원 | 특징 |
|------|------|------|
| `all-MiniLM-L6-v2` | 384 | 빠르고 가벼움, 영어 최적화 |
| `multilingual-e5-large` | 1024 | 다국어 지원, 한국어 성능 우수 |
| `nomic-embed-text` | 768 | Ollama에서 바로 사용 가능 |

### 클라우드 API

| 모델 | 차원 | 특징 |
|------|------|------|
| OpenAI `text-embedding-3-small` | 1536 | 높은 품질, 유료 |
| Cohere `embed-multilingual-v3` | 1024 | 다국어 강점 |

## 핵심 개념

### 벡터 공간

임베딩은 고차원 공간의 한 점이다. 의미가 비슷한 텍스트는 이 공간에서 **가까이** 위치한다.

### 차원의 저주

차원이 높을수록 더 세밀한 의미를 표현할 수 있지만, 계산 비용이 커지고 저장 공간이 늘어난다. 384차원 vs 1024차원 — 트레이드오프.

### 한계

- 같은 단어라도 문맥에 따라 의미가 달라질 수 있다 (다의어 문제)
- 매우 긴 텍스트는 하나의 벡터로 압축하면 정보 손실이 발생한다
- 훈련 데이터에 없던 도메인의 텍스트는 임베딩 품질이 떨어질 수 있다

## 실습 코드

```python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

# 텍스트 임베딩
sentences = [
    "인공지능은 인간의 지능을 모방하는 기술이다",
    "AI는 사람처럼 생각하는 컴퓨터 시스템을 말한다",
    "오늘 저녁은 파스타를 먹었다",
]

embeddings = model.encode(sentences)

# 유사도 비교
for i in range(len(sentences)):
    for j in range(i + 1, len(sentences)):
        sim = np.dot(embeddings[i], embeddings[j]) / (
            np.linalg.norm(embeddings[i]) * np.linalg.norm(embeddings[j])
        )
        print(f'"{sentences[i][:20]}..." vs "{sentences[j][:20]}...": {sim:.3f}')
```

출력 예시:
```
"인공지능은 인간의 지능을..." vs "AI는 사람처럼 생각하는...": 0.847
"인공지능은 인간의 지능을..." vs "오늘 저녁은 파스타를 먹...": 0.102
"AI는 사람처럼 생각하는..." vs "오늘 저녁은 파스타를 먹...": 0.087
```

의미가 비슷한 문장은 높은 유사도, 관련 없는 문장은 낮은 유사도를 보인다.

---

## 다음으로 읽을 자료
- [벡터 DB 비교](/study/vector-db-comparison) — 임베딩 벡터를 저장하고 검색하는 데이터베이스 종류와 특성을 비교한다.
- [RAG 아키텍처 해부](/study/rag-architecture) — 임베딩을 활용한 검색 증강 생성(RAG) 파이프라인의 전체 구조를 이해한다.
