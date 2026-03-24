---
title: "NLP 기초"
description: "토큰화(BPE, WordPiece), 텍스트 전처리, 어휘 크기 트레이드오프. tiktoken 실습 포함."
sources:
  - type: github
    label: "openai/tiktoken (13k+ stars)"
    url: "https://github.com/openai/tiktoken"
  - type: paper
    label: "BPE 원본 논문 (Sennrich et al., 2016)"
    url: "https://arxiv.org/abs/1508.07909"
  - type: official-docs
    label: "Hugging Face Tokenizers 문서"
    url: "https://huggingface.co/docs/tokenizers"
youtube:
  - "zduSFxRajkE"
---

> **20분 읽기** | 핵심: 텍스트를 모델이 처리할 수 있는 숫자 단위(토큰)로 변환하는 과정과 그 설계 결정이 ATHENA 시스템 전체에 미치는 영향.
> 7개 학습 자료 중 보충 자료. 권장 순서: 환경 세팅 → 임베딩 → 벡터 DB → RAG 아키텍처 → LLM 선택 → GraphRAG

## 1. 개요: 왜 토큰화가 ATHENA에 중요한가?

ATHENA 시스템에서 토큰화는 세 가지 핵심 지점에 직접 영향을 준다.

1. **청킹(Chunking)**: 문서를 벡터 DB에 넣기 전에 적절한 크기로 분할해야 한다. "적절한 크기"의 기준은 글자 수가 아니라 **토큰 수**다. 같은 500자라도 한국어와 영어는 토큰 수가 크게 다르다.
2. **API 비용 계산**: OpenAI, Anthropic 등의 API는 **토큰 단위로 과금**한다. 토큰 수를 정확히 예측하지 못하면 예산 관리가 불가능하다. ATHENA 프로젝트 월 예산이 5만원인 상황에서 이건 생존의 문제다.
3. **임베딩 품질**: 임베딩 모델도 입력 토큰 수에 제한이 있다. 토큰 제한을 초과하면 텍스트가 잘리고, 잘린 텍스트의 임베딩은 원본의 의미를 온전히 담지 못한다.

<div class="flow">
  <div class="flow-badge flow-badge-primary">사용자 문서</div>
  <div class="flow-arrow">→</div>
  <div class="flow-badge flow-badge-muted">토큰화 *</div>
  <div class="flow-arrow">→</div>
  <div class="flow-badge flow-badge-primary">토큰 수 기반 청킹</div>
  <div class="flow-arrow">→</div>
  <div class="flow-badge flow-badge-primary">임베딩</div>
  <div class="flow-arrow">→</div>
  <div class="flow-badge flow-badge-primary">벡터 DB 저장</div>
</div>

<div class="callout callout-amber">
  <strong>* 이 단계를 이해해야 나머지가 제대로 돌아간다</strong> — 토큰화는 NLP 파이프라인의 첫 번째 관문이다.
</div>

정리하면, 토큰화는 NLP 파이프라인의 **첫 번째 관문**이다. 여기서 내리는 결정이 이후 모든 단계의 품질과 비용을 좌우한다.

## 2. 핵심 개념

### 2.1 토큰이란?

모델이 텍스트를 처리하는 **최소 단위**를 토큰이라 한다. 토큰은 글자도 아니고 단어도 아닌, 그 사이 어딘가에 있는 **서브워드(subword)** 단위다.

세 가지 분할 방식을 비교해보자.

| 방식 | "토큰화는 중요합니다" 분할 결과 | 특징 |
|------|------|------|
| **글자 단위** | `토`, `큰`, `화`, `는`, `중`, `요`, `합`, `니`, `다` | 어휘가 작지만 시퀀스가 길다 |
| **단어 단위** | `토큰화는`, `중요합니다` | 시퀀스가 짧지만 어휘가 폭발한다 |
| **서브워드** | `토큰`, `화는`, `중요`, `합니다` | 둘의 균형점 |

현대 LLM은 거의 모두 **서브워드 토큰화**를 사용한다. 자주 등장하는 문자열은 하나의 토큰으로 묶고, 드문 문자열은 더 작은 단위로 쪼갠다.

### 2.2 BPE (Byte Pair Encoding)

BPE는 가장 널리 사용되는 서브워드 토큰화 알고리즘이다. GPT 계열 모델이 모두 BPE 기반이다.

**핵심 아이디어**: 가장 자주 등장하는 연속 쌍(pair)을 반복적으로 병합한다.

단계별로 보자. 학습 데이터에 `low`, `lower`, `newest`, `widest`가 있다고 가정한다.

```
[초기 상태 — 글자 단위]
l o w          (빈도: 5)
l o w e r      (빈도: 2)
n e w e s t    (빈도: 6)
w i d e s t    (빈도: 3)

[1단계] 가장 빈번한 쌍 찾기: (e, s) → 9회 등장
→ "es"를 하나의 토큰으로 병합
l o w
l o w e r
n e w es t
w i d es t

[2단계] 다음 빈번한 쌍: (es, t) → 9회
→ "est"를 하나의 토큰으로 병합
l o w
l o w e r
n e w est
w i d est

[3단계] 다음 빈번한 쌍: (l, o) → 7회
→ "lo"를 하나의 토큰으로 병합
lo w
lo w e r
n e w est
w i d est

... 이런 식으로 원하는 어휘 크기에 도달할 때까지 반복한다.
```

**BPE의 장점**:
- 자주 쓰이는 단어는 하나의 토큰이 된다 (예: `the`, `is`)
- 처음 보는 단어도 서브워드 조합으로 표현 가능하다 (OOV 문제 해결)
- 학습 데이터 기반이므로 도메인에 맞게 조정된다

**GPT-4o의 BPE 구현 (tiktoken)**:

GPT-4o는 바이트 수준 BPE를 사용한다. 유니코드 문자가 아니라 **바이트**를 기본 단위로 삼기 때문에, 어떤 언어든 처리할 수 있다. 이 구현체가 바로 `tiktoken`이다.

### 2.3 WordPiece

WordPiece는 Google의 BERT 계열 모델이 사용하는 토큰화 알고리즘이다. BPE와 매우 유사하지만 병합 기준이 다르다.

| | BPE | WordPiece |
|---|---|---|
| **병합 기준** | 가장 빈번한 쌍 | 병합 시 전체 학습 데이터의 **우도(likelihood)가 가장 높아지는** 쌍 |
| **사용 모델** | GPT 계열, LLaMA | BERT, DistilBERT |
| **접두사 표시** | 없음 | 단어 중간 토큰에 `##` 접두사 부착 |

WordPiece 예시:

```
"토큰화" → ["토", "##큰", "##화"]
"embedding" → ["em", "##bed", "##ding"]
```

`##`은 "이 토큰은 단어의 시작이 아니라 이전 토큰에 이어지는 조각"이라는 표시다. ATHENA에서는 주로 GPT 계열 모델을 쓰므로 BPE가 더 중요하지만, 임베딩 모델로 BERT 기반 모델(예: `sentence-transformers`)을 쓸 때는 WordPiece가 적용된다.

### 2.4 어휘 크기 트레이드오프

토큰화 알고리즘을 설계할 때 가장 중요한 결정 중 하나가 **어휘(vocabulary) 크기**다.

<div class="compare-grid">
  <div class="compare-item compare-before">
    <div class="compare-label">작은 어휘</div>
    <strong>256개</strong> (바이트 수준)<br/>시퀀스 길다 / OOV 강함 / 모델 작음
  </div>
  <div class="compare-item compare-after">
    <div class="compare-label">큰 어휘</div>
    <strong>200,000개</strong> (대규모 서브워드)<br/>시퀀스 짧다 / 빠른 학습 / 비용 절감
  </div>
</div>

| | 작은 어휘 (예: 10,000개) | 큰 어휘 (예: 100,000개) |
|---|---|---|
| **시퀀스 길이** | 길다 (더 많은 토큰 필요) | 짧다 (자주 쓰는 단어가 1토큰) |
| **OOV 처리** | 강함 (어떤 텍스트든 분해 가능) | 약함 (어휘에 없는 패턴 처리 어려움) |
| **모델 크기** | 작음 (임베딩 테이블이 작음) | 큼 (임베딩 테이블이 큼) |
| **학습 효율** | 패턴 파악에 더 많은 학습 필요 | 빠르게 패턴 학습 |
| **API 비용** | 같은 텍스트에 더 많은 토큰 → 비용 증가 | 같은 텍스트에 적은 토큰 → 비용 감소 |

실제 모델들의 어휘 크기:

| 모델 | 어휘 크기 |
|------|-----------|
| GPT-2 | ~50,257 |
| GPT-4 | ~100,000 |
| GPT-4o | ~200,000 |
| BERT | ~30,522 |
| LLaMA 2 | ~32,000 |

GPT-4o의 어휘가 GPT-2의 4배인 이유는 다국어 지원 강화 때문이다. 어휘가 커지면 한국어 같은 비영어 텍스트의 토큰 효율이 크게 개선된다.

### 2.5 한국어 토큰화의 특수성

한국어는 영어와 근본적으로 다른 문자 체계를 갖고 있어 토큰화에서 특수한 문제가 발생한다.

**문제 1: 토큰 효율이 낮다**

영어 모델 기반 토크나이저는 한국어를 처리할 때 토큰을 훨씬 많이 사용한다.

<div class="compare-grid">
  <div class="compare-item compare-after">
    <div class="compare-label">영어</div>
    "The decision was made" → <strong>5 토큰</strong>
  </div>
  <div class="compare-item compare-before">
    <div class="compare-label">한국어</div>
    "의사결정이 이루어졌다" → <strong>9~12 토큰</strong> (모델에 따라 다름)
  </div>
</div>

같은 의미인데 한국어가 2배 이상의 토큰을 소모한다. API 비용 관점에서 이는 심각한 문제다.

**문제 2: 교착어 특성**

한국어는 교착어(膠着語)다. 어근에 조사/어미가 붙어서 의미가 변한다.

<div class="flow">
  <div class="flow-badge flow-badge-primary">결정</div>
  <div class="flow-arrow">→</div>
  <div class="flow-badge flow-badge-muted">결정이</div>
  <div class="flow-badge flow-badge-muted">결정을</div>
  <div class="flow-badge flow-badge-muted">결정에</div>
  <div class="flow-badge flow-badge-muted">결정으로</div>
  <div class="flow-badge flow-badge-muted">결정이었다</div>
  <div class="flow-badge flow-badge-muted">결정했다</div>
  <div class="flow-badge flow-badge-muted">...</div>
</div>

영어의 `decision`은 대부분 1토큰이지만, 한국어 "결정"의 변형은 각각 다른 토큰 조합이 될 수 있다. 형태소 분석을 통해 어근과 조사/어미를 분리하면 효율이 좋아지지만, 범용 토크나이저(BPE, WordPiece)는 이런 언어학적 지식 없이 통계적으로만 분할한다.

**문제 3: 자모 분해**

한국어 글자는 초성+중성+종성으로 구성된다. 어휘에 없는 음절을 만나면 토크나이저가 자모 단위까지 분해할 수 있다.

<div class="callout callout-amber">
  <strong>"뷁" (드문 음절)</strong> → 바이트 단위로 3~4개 토큰으로 분해될 수 있음
</div>

**ATHENA에 주는 영향**:
- 한국어 문서를 청킹할 때 영어 기준 토큰 수를 그대로 적용하면 안 된다
- 동일 의미라도 한국어 처리 비용이 1.5~2.5배 높다는 점을 예산 계획에 반영해야 한다
- 한국어 특화 임베딩 모델(`multilingual-e5-large` 등)을 사용하면 토큰 효율이 개선된다

## 3. 실습: tiktoken으로 토큰 카운트

> 아래 코드를 Jupyter에서 직접 실행해보자. 먼저 tiktoken을 설치한다.

```bash
pip install tiktoken
```

### 3.1 기본 사용법

```python
import tiktoken

# GPT-4o의 토크나이저 로드
enc = tiktoken.encoding_for_model("gpt-4o")

# 텍스트를 토큰으로 변환
text = "ATHENA는 의사결정을 추적합니다"
tokens = enc.encode(text)

print(f"원문: {text}")
print(f"토큰 수: {len(tokens)}")
print(f"토큰 ID: {tokens}")

# 각 토큰이 어떤 텍스트에 대응하는지 확인
for token_id in tokens:
    token_bytes = enc.decode_single_token_raw(token_id)
    print(f"  {token_id} → {token_bytes}")
```

출력 예시:
```
원문: ATHENA는 의사결정을 추적합니다
토큰 수: 8
토큰 ID: [32, 4690, 8895, ...] (모델 버전에 따라 다름)
```

### 3.2 한국어 vs 영어 토큰 효율 비교

```python
import tiktoken

enc = tiktoken.encoding_for_model("gpt-4o")

texts = {
    "영어": "The knowledge graph tracks decision-making rationale",
    "한국어": "지식 그래프가 의사결정 근거를 추적한다",
    "혼합": "ATHENA의 Knowledge Graph는 의사결정을 추적합니다",
}

for lang, text in texts.items():
    tokens = enc.encode(text)
    ratio = len(tokens) / len(text)
    print(f"[{lang}] '{text}'")
    print(f"  글자 수: {len(text)}, 토큰 수: {len(tokens)}, 토큰/글자 비율: {ratio:.2f}")
    print()
```

출력 예시:
```
[영어] 'The knowledge graph tracks decision-making rationale'
  글자 수: 52, 토큰 수: 7, 토큰/글자 비율: 0.13

[한국어] '지식 그래프가 의사결정 근거를 추적한다'
  글자 수: 20, 토큰 수: 10, 토큰/글자 비율: 0.50

[혼합] 'ATHENA의 Knowledge Graph는 의사결정을 추적합니다'
  글자 수: 35, 토큰 수: 12, 토큰/글자 비율: 0.34
```

한국어의 토큰/글자 비율이 영어보다 3~4배 높다. 같은 분량의 텍스트라도 한국어가 훨씬 많은 토큰을 소모한다는 뜻이다.

### 3.3 API 비용 추정 함수

```python
import tiktoken

def estimate_cost(text: str, model: str = "gpt-4o") -> dict:
    """텍스트의 토큰 수와 예상 API 비용을 계산한다.

    Args:
        text: 비용을 계산할 텍스트
        model: 사용할 모델 이름

    Returns:
        토큰 수, 입력 비용, 출력 비용(동일 길이 가정) 딕셔너리
    """
    enc = tiktoken.encoding_for_model(model)
    tokens = enc.encode(text)
    n_tokens = len(tokens)

    # 가격표 (2025년 기준, USD per 1M tokens)
    pricing = {
        "gpt-4o":      {"input": 2.50, "output": 10.00},
        "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    }

    price = pricing.get(model, pricing["gpt-4o"])
    input_cost = (n_tokens / 1_000_000) * price["input"]
    output_cost = (n_tokens / 1_000_000) * price["output"]

    return {
        "model": model,
        "tokens": n_tokens,
        "input_cost_usd": round(input_cost, 6),
        "output_cost_usd": round(output_cost, 6),
    }


# 사용 예시
sample = "ATHENA는 의사결정 근거를 Knowledge Graph로 구조화하여 '왜?' 질문에 인과 사슬로 응답하는 시스템입니다."
result = estimate_cost(sample, "gpt-4o")
print(f"토큰 수: {result['tokens']}")
print(f"입력 비용: ${result['input_cost_usd']}")

# 대량 문서 처리 시 비용 추정 (예: Notion 문서 100개, 평균 2000자)
total_chars = 100 * 2000
sample_ratio = result["tokens"] / len(sample)
estimated_tokens = int(total_chars * sample_ratio)
monthly_cost_usd = (estimated_tokens / 1_000_000) * 2.50
print(f"\n[대량 처리 추정]")
print(f"예상 총 토큰: {estimated_tokens:,}")
print(f"gpt-4o 입력 비용: ${monthly_cost_usd:.2f}")
print(f"원화 환산 (1300원/달러): ₩{monthly_cost_usd * 1300:,.0f}")
```

### 3.4 청킹 크기를 토큰 기준으로 결정하기

```python
import tiktoken

def chunk_by_tokens(text: str, max_tokens: int = 500, overlap: int = 50, model: str = "gpt-4o") -> list[str]:
    """텍스트를 토큰 기준으로 청킹한다.

    Args:
        text: 분할할 텍스트
        max_tokens: 청크당 최대 토큰 수
        overlap: 청크 간 겹치는 토큰 수
        model: 토크나이저 모델

    Returns:
        청크 리스트
    """
    enc = tiktoken.encoding_for_model(model)
    tokens = enc.encode(text)

    chunks = []
    start = 0

    while start < len(tokens):
        end = min(start + max_tokens, len(tokens))
        chunk_tokens = tokens[start:end]
        chunk_text = enc.decode(chunk_tokens)
        chunks.append(chunk_text)
        start += max_tokens - overlap

    return chunks


# 사용 예시
long_text = """ATHENA는 AI 기반 지식 관리 시스템이다.
의사결정 근거를 Knowledge Graph로 구조화하여 '왜?' 질문에 인과 사슬로 응답한다.
기존 RAG 시스템은 단순 유사도 검색만 수행하지만, ATHENA는 지식 간의 관계와 인과를 추적한다.
이를 통해 단순히 '관련 문서'를 찾는 것이 아니라, '왜 그런 결정을 내렸는지'를 설명할 수 있다.
Neo4j 기반의 Knowledge Graph에 엔티티와 관계를 저장하고,
LLM이 그래프 구조를 탐색하며 인과 사슬을 구성한다."""

chunks = chunk_by_tokens(long_text, max_tokens=50, overlap=10)
enc = tiktoken.encoding_for_model("gpt-4o")

for i, chunk in enumerate(chunks):
    tokens = enc.encode(chunk)
    print(f"[청크 {i+1}] 토큰 수: {len(tokens)}")
    print(f"  {chunk[:60]}...")
    print()
```

## 4. ATHENA 연결: 실제 설계 결정

### 4.1 청킹 크기 결정

ATHENA에서 Notion 문서를 벡터 DB에 넣을 때, 청크 크기를 어떻게 정해야 할까?

**글자 수 기반의 함정**: "500자로 자르자"는 단순해 보이지만, 한국어 500자와 영어 500자는 토큰 수가 전혀 다르다. 임베딩 모델의 입력 제한이 512토큰이라면, 한국어 500자는 이를 초과할 수 있다.

**권장 접근법**:
1. 사용할 임베딩 모델의 **최대 토큰 수**를 확인한다
2. 여유를 두고 그 80% 정도를 청크 크기로 설정한다
3. `tiktoken`이나 해당 모델의 토크나이저로 **토큰 수 기준**으로 청킹한다

```python
# ATHENA에서의 청킹 설정 예시
EMBEDDING_MODEL_MAX_TOKENS = 512  # nomic-embed-text 기준
CHUNK_MAX_TOKENS = 400            # 80% 여유
CHUNK_OVERLAP_TOKENS = 50         # 문맥 연속성을 위한 겹침
```

### 4.2 API 비용 관리

ATHENA 프로젝트의 월 예산은 5만원이다. 한국어 텍스트의 토큰 비효율을 감안하면, 실제로 처리할 수 있는 텍스트 양을 미리 계산해야 한다.

```python
# ATHENA 월 예산 계산 예시
MONTHLY_BUDGET_KRW = 50_000
USD_TO_KRW = 1_300
MONTHLY_BUDGET_USD = MONTHLY_BUDGET_KRW / USD_TO_KRW  # ≈ $38.46

# gpt-4o-mini 기준 (입력 $0.15/1M tokens)
max_input_tokens = (MONTHLY_BUDGET_USD / 0.15) * 1_000_000  # ≈ 2.56억 토큰

# 한국어 텍스트 기준 (평균 0.5 토큰/글자)
max_korean_chars = max_input_tokens / 0.5  # ≈ 5.12억 글자

print(f"월 예산: ₩{MONTHLY_BUDGET_KRW:,} (${MONTHLY_BUDGET_USD:.2f})")
print(f"gpt-4o-mini 최대 입력 토큰: {max_input_tokens:,.0f}")
print(f"한국어 기준 최대 처리 글자 수: {max_korean_chars:,.0f}")
```

핵심 교훈: 비용을 줄이려면 **개발 중에는 Ollama 로컬 모델을 우선 활용**하고, 클라우드 API는 평가/데모 단계에서 사용하는 전략이 유효하다. 팀 내에서 API 사용 범위는 프로젝트 진행에 따라 조정될 수 있다.

## 5. 체크포인트

스스로 생각해본 뒤, 답을 펼쳐 확인하자.

<details>
<summary>Q1. 토큰이 "글자"도 "단어"도 아닌 "서브워드"인 이유는?</summary>

글자 단위는 시퀀스가 너무 길어지고, 단어 단위는 어휘가 폭발한다. 서브워드는 자주 쓰는 문자열을 하나로 묶고 드문 문자열은 잘게 쪼개서, 어휘 크기와 시퀀스 길이의 균형을 잡는다.

</details>

<details>
<summary>Q2. BPE 알고리즘의 핵심 동작을 설명할 수 있는가?</summary>

글자 단위에서 시작하여, 가장 자주 등장하는 연속 쌍(pair)을 반복적으로 병합한다. 원하는 어휘 크기에 도달할 때까지 이 과정을 반복하면, 자주 쓰이는 패턴이 하나의 토큰이 된다.

</details>

<details>
<summary>Q3. 어휘 크기가 크면 좋은 점과 나쁜 점은? (각 2가지 이상)</summary>

**좋은 점**: 시퀀스가 짧아져 처리 속도가 빨라진다 / 같은 텍스트에 적은 토큰 → API 비용 절감

**나쁜 점**: 모델의 임베딩 테이블이 커져 모델 크기가 증가한다 / 어휘에 없는 새로운 패턴 처리가 어렵다

</details>

<details>
<summary>Q4. 한국어가 영어보다 토큰 효율이 낮은 이유는?</summary>

대부분의 토크나이저가 영어 중심 데이터로 학습되어, 영어 단어는 1토큰으로 처리되는 반면 한국어는 더 작은 단위로 쪼개진다. 또한 한국어는 교착어라 어근에 조사/어미가 붙어 변형이 많아, 각 변형이 별도의 토큰 조합이 된다.

</details>

<details>
<summary>Q5. ATHENA에서 청킹 크기를 글자 수가 아닌 토큰 수 기준으로 정해야 하는 이유는?</summary>

임베딩 모델과 LLM의 입력 제한은 **토큰 수** 기준이다. 같은 500자라도 한국어와 영어는 토큰 수가 크게 다르므로, 글자 수로 자르면 임베딩 모델의 토큰 제한을 초과하거나 예산 추정이 부정확해진다.

</details>

---

## 다음으로 읽을 자료
- [임베딩이란?](/study/embedding-concepts) — 토큰화된 텍스트가 어떻게 벡터로 변환되는지, 의미 기반 검색의 원리를 이해한다.
- [RAG 아키텍처 해부](/study/rag-architecture) — 토큰화와 임베딩을 활용한 전체 RAG 파이프라인의 구조를 알아본다.
