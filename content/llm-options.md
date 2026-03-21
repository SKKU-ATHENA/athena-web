---
title: "LLM 선택지 정리"
description: "클라우드 vs 로컬, 비용, 품질 트레이드오프"
sources:
  - type: github
    label: "ollama/ollama (130k+ stars)"
    url: "https://github.com/ollama/ollama"
  - type: official-docs
    label: "OpenAI API 문서"
    url: "https://platform.openai.com/docs/"
  - type: official-docs
    label: "Anthropic API 문서"
    url: "https://docs.anthropic.com/"
youtube:
  - "5sLYAQS9sWQ"
---

## 개요

LLM(Large Language Model)은 RAG 파이프라인의 마지막 단계에서 답변을 생성하는 핵심 컴포넌트. 크게 **클라우드 API**와 **로컬 실행** 두 가지 방식으로 나뉜다.

## 클라우드 vs 로컬

| 특성 | 클라우드 API | 로컬 (Ollama) |
|------|------------|---------------|
| **비용** | 사용량 과금 | 무료 (전기세만) |
| **품질** | 최고 수준 | 모델에 따라 다름 |
| **속도** | 네트워크 의존 | GPU에 의존 |
| **프라이버시** | 데이터가 외부로 전송 | 데이터가 로컬에 유지 |
| **설치** | API 키만 필요 | 모델 다운로드 필요 |
| **인터넷** | 필수 | 불필요 |

## 클라우드 API 모델

### OpenAI

| 모델 | 입력 가격 | 출력 가격 | 특징 |
|------|----------|----------|------|
| `gpt-4o` | $2.5/1M | $10/1M | 최고 성능 |
| `gpt-4o-mini` | $0.15/1M | $0.6/1M | 가성비 최고 |

> 💡 1M 토큰 ≈ 약 75만 단어. 일반 문서 약 1,500페이지 분량이다.

### Anthropic

| 모델 | 입력 가격 | 출력 가격 | 특징 |
|------|----------|----------|------|
| `claude-sonnet-4-5` | $3/1M | $15/1M | 긴 컨텍스트, 정확도 |
| `claude-haiku-3-5` | $0.8/1M | $4/1M | 빠르고 저렴 |

### ATHENA 프로젝트 비용 규칙

- 총 API 예산: 20만원
- 월별 한도: 5만원/월
- **개발 중에는 Ollama 로컬 모델 우선**
- 저가 모델(gpt-4o-mini) 사용
- 고가 모델은 평가/데모 시에만

## 로컬 모델 (Ollama)

### 설치 및 사용

```bash
# Ollama 설치 후
ollama pull llama3        # 8B 파라미터, 범용
ollama pull gemma2        # Google, 가벼움
ollama pull mistral       # Mistral AI, 빠름
ollama pull phi3          # Microsoft, 소형
```

### 모델 선택 가이드

| 모델 | 크기 | VRAM | 한국어 | 추천 용도 |
|------|------|------|-------|----------|
| `llama3` (8B) | ~4.7GB | 8GB+ | 보통 | 범용, 추론 |
| `gemma2` (9B) | ~5.4GB | 8GB+ | 보통 | 빠른 응답 |
| `mistral` (7B) | ~4.1GB | 8GB+ | 약함 | 영어 위주 |
| `phi3` (3.8B) | ~2.3GB | 4GB+ | 약함 | 저사양 PC |

### Python에서 사용

```python
import ollama

# 텍스트 생성
response = ollama.chat(
    model="llama3",
    messages=[
        {"role": "system", "content": "당신은 도움이 되는 AI 어시스턴트입니다."},
        {"role": "user", "content": "RAG가 무엇인가요?"},
    ],
)
print(response["message"]["content"])
```

## 임베딩 모델

RAG에서는 텍스트 생성 모델 외에 **임베딩 모델**도 필요하다.

### 로컬 임베딩

```bash
ollama pull nomic-embed-text  # 768차원
```

```python
# Ollama로 임베딩
result = ollama.embed(model="nomic-embed-text", input="인공지능")
vector = result["embeddings"][0]  # 768차원 벡터
```

### 오픈소스 임베딩

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")  # 384차원
vector = model.encode("인공지능")
```

## 사전 과제에서는?

- **Ollama + llama3** 조합을 권장 (비용 0, 품질 충분)
- 임베딩은 `nomic-embed-text` 또는 `sentence-transformers`
- GPU가 없어도 CPU로 실행 가능 (느리지만 동작함)
- 도구 선택 보고서에 **왜 이 모델을 선택했는지** 근거를 작성할 것

---

## 다음으로 읽을 자료
- [GraphRAG 개념](/study/graphrag-concepts) — 기본 RAG를 넘어 지식 그래프를 활용한 고급 검색 생성 기법을 알아본다.
- [사전 과제](/pre-assignment) — 학습한 내용을 바탕으로 직접 RAG 시스템을 구현하는 실습 과제를 진행한다.
