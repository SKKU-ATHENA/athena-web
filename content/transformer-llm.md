---
title: "Transformer & LLM 작동 원리"
description: "어텐션 메커니즘 직관적 설명, GPT/BERT/LLaMA 계보, 토큰 생성 과정, temperature/top-p."
sources:
  - type: paper
    label: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
  - type: github
    label: "meta-llama/llama (70k+ stars)"
    url: "https://github.com/meta-llama/llama"
  - type: official-docs
    label: "Ollama 모델 라이브러리"
    url: "https://ollama.ai/library"
youtube:
  - "wjZofJX0v4M"
---

> **30분 읽기** | 핵심: Transformer가 어떻게 작동하고, LLM이 어떻게 텍스트를 생성하는지 이해하면 ATHENA 시스템 설계에서 더 나은 결정을 내릴 수 있다.

## 1. 개요: 왜 Transformer를 이해해야 하는가?

ATHENA는 LLM을 핵심 엔진으로 사용하는 지식 관리 시스템이다. LLM에게 질문하면 답이 나온다 — 하지만 **왜** 그 답이 나왔는지, **언제** 잘못된 답이 나올 수 있는지 이해하려면 내부 작동 원리를 알아야 한다.

자동차를 운전하려면 엔진 설계도를 몰라도 되지만, 자동차를 **만드는 사람**은 엔진을 이해해야 한다. 우리는 LLM을 **사용**만 하는 것이 아니라, LLM 위에 시스템을 **구축**하고 있다.

이 글을 읽고 나면 다음 질문에 답할 수 있다:

- LLM이 "다음 단어를 예측"한다는 게 정확히 무슨 뜻인가?
- temperature를 높이면 왜 답변이 다양해지는가?
- Ollama로 로컬에서 LLM을 돌릴 때 어떤 일이 벌어지는가?
- RAG에서 프롬프트 길이 제한이 왜 생기는가?

## 2. 핵심 개념

### Transformer 이전: RNN의 한계

Transformer가 등장하기 전, 자연어 처리의 주류 모델은 **RNN(Recurrent Neural Network)**이었다.

RNN을 비유하면 **한 줄로 늘어선 사람들이 귓속말 전달 게임을 하는 것**과 같다. 첫 번째 사람이 메시지를 받아 두 번째에게 전달하고, 두 번째가 세 번째에게 전달하는 식이다.

<div class="diagram-box">
  <div class="diagram-title">RNN 순차 처리 구조</div>
  <div class="flow">
    <div class="flow-badge flow-badge-primary">나는</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">오늘</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">학교에</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-primary">갔다</div>
  </div>
  <div style="text-align:center; margin:0.5rem 0; color:var(--muted);">↓ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ↓ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ↓ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ↓</div>
  <div class="flow">
    <div class="flow-badge flow-badge-muted">h₁</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-muted">h₂</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-muted">h₃</div>
    <div class="flow-arrow">→</div>
    <div class="flow-badge flow-badge-muted">h₄</div>
  </div>
</div>

이 구조의 근본적 문제 두 가지:

1. **순차 처리**: 단어를 하나씩 순서대로 처리해야 해서 느리다. 1000단어 문장이면 1000단계를 거쳐야 한다. GPU의 병렬 처리 능력을 활용할 수 없다.
2. **장기 의존성 소실**: 문장이 길어지면 앞부분의 정보가 뒷부분에 전달되기까지 여러 단계를 거치면서 희석된다. 귓속말 게임에서 10명을 거치면 원래 메시지가 변질되는 것과 같다.

<div class="callout callout-amber">
  <strong>장기 의존성 소실 예시</strong>
  "작년 여름에 <span class="kw">부산</span>에서 먹은 <span class="kw">밀면</span>이 정말 맛있었는데, 그 가게 이름이 뭐였지?"<br><br>
  → 문장 끝부분에서 "가게 이름"을 처리할 때, 앞부분의 <span class="kw">부산</span>과 <span class="kw">밀면</span> 정보가 이미 희석되어 있을 수 있다.
</div>

### 어텐션 메커니즘: "중요한 부분에 집중"

2017년 Google 연구팀이 발표한 논문 *"Attention Is All You Need"*가 모든 것을 바꿨다.

**어텐션(Attention)**을 비유하면 **형광펜으로 밑줄을 치면서 책을 읽는 것**이다.

책 한 챕터를 다 읽은 뒤 요약문을 써야 한다고 하자. 전체 내용을 다 기억하려 하기보다는, 중요한 부분에 형광펜을 치고 그 부분을 참고하면서 쓴다. 어텐션 메커니즘이 하는 일이 정확히 이것이다. 모든 단어를 균등하게 보는 대신, **지금 처리 중인 부분과 관련이 깊은 단어에 더 높은 가중치(attention weight)**를 부여한다.

<div class="diagram-box">
  <div class="diagram-title">어텐션 가중치 — 질문: "그 가게 이름이 뭐였지?"</div>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="padding:4px 8px;">"작년"</td><td style="padding:4px 8px;">0.02</td><td style="padding:4px 8px; color:var(--muted);">별로 중요하지 않음</td></tr>
    <tr><td style="padding:4px 8px;">"여름에"</td><td style="padding:4px 8px;">0.01</td><td style="padding:4px 8px;"></td></tr>
    <tr style="background:rgba(234,179,8,0.1);"><td style="padding:4px 8px;"><strong>"부산에서"</strong></td><td style="padding:4px 8px;"><strong>0.15</strong></td><td style="padding:4px 8px;">장소 정보, 꽤 중요</td></tr>
    <tr><td style="padding:4px 8px;">"먹은"</td><td style="padding:4px 8px;">0.05</td><td style="padding:4px 8px;"></td></tr>
    <tr style="background:rgba(234,179,8,0.1);"><td style="padding:4px 8px;"><strong>"밀면이"</strong></td><td style="padding:4px 8px;"><strong>0.12</strong></td><td style="padding:4px 8px;">음식 정보, 관련 있음</td></tr>
    <tr><td style="padding:4px 8px;">"맛있었는데"</td><td style="padding:4px 8px;">0.03</td><td style="padding:4px 8px;"></td></tr>
    <tr><td style="padding:4px 8px;">"그"</td><td style="padding:4px 8px;">0.07</td><td style="padding:4px 8px;"></td></tr>
    <tr style="background:rgba(234,179,8,0.25);"><td style="padding:4px 8px;"><strong>"가게"</strong></td><td style="padding:4px 8px;"><strong>0.35</strong></td><td style="padding:4px 8px;">⬅ 가장 높은 가중치!</td></tr>
    <tr style="background:rgba(234,179,8,0.1);"><td style="padding:4px 8px;"><strong>"이름이"</strong></td><td style="padding:4px 8px;"><strong>0.15</strong></td><td style="padding:4px 8px;"></td></tr>
    <tr><td style="padding:4px 8px;">"뭐였지"</td><td style="padding:4px 8px;">0.05</td><td style="padding:4px 8px;"></td></tr>
  </table>
</div>

RNN의 귓속말 게임과 달리, 어텐션은 **모든 위치에서 모든 위치로 직접 연결**할 수 있다. 문장이 아무리 길어도 첫 단어와 마지막 단어 사이의 관계를 한 번에 계산한다.

### Self-Attention: 모든 단어가 모든 단어와 관계를 맺다

Transformer의 핵심은 **Self-Attention**이다. 한 문장 안에서 모든 단어가 다른 모든 단어와의 관계를 계산한다.

비유하자면, 교실에 학생 30명이 있다고 하자. 선생님이 "조별 과제 하세요"라고 하면, 각 학생이 나머지 29명 모두와 "너랑 나랑 같이 하면 시너지가 얼마나 날까?"를 계산하는 것이다. 그 결과를 바탕으로 각자 **누구의 의견을 얼마나 참고할지** 결정한다.

<div class="diagram-box">
  <div class="diagram-title">Self-Attention 예시 — "고양이가 매트 위에 앉았다"</div>
  <div class="flow">
    <div class="flow-badge flow-badge-primary">고양이가: 0.4</div>
    <div class="flow-badge flow-badge-muted">매트: 0.1</div>
    <div class="flow-badge flow-badge-muted">위에: 0.05</div>
    <div class="flow-badge flow-badge-primary">앉았다: 0.45</div>
  </div>
  <div class="callout callout-blue" style="margin-top:0.75rem;">
    <strong>"고양이"와 "앉았다"</strong>는 주어-동사 관계로 가장 강한 어텐션 가중치를 가진다.
  </div>
</div>

Self-Attention이 계산하는 세 가지:

- **Query (Q)**: "나는 무엇을 찾고 있는가?" — 현재 단어의 질문
- **Key (K)**: "나는 무엇을 제공할 수 있는가?" — 각 단어의 라벨
- **Value (V)**: "내가 제공하는 실제 정보" — 각 단어의 내용

수식 없이 직관적으로 설명하면:

1. 각 단어가 Q, K, V 세 가지 역할을 동시에 수행한다.
2. 한 단어의 Q가 다른 모든 단어의 K와 비교되어 "관련도 점수"를 매긴다.
3. 그 점수에 따라 V를 가중 합산하여 최종 표현을 만든다.

이 과정이 **병렬로** 실행된다. 모든 단어 쌍의 관계를 동시에 계산하므로 GPU를 효율적으로 활용할 수 있고, RNN보다 훨씬 빠르다.

### Multi-Head Attention: 여러 관점에서 보기

실제 Transformer는 Self-Attention을 한 번만 하지 않고, **여러 개의 "헤드"**에서 동시에 수행한다. 이것을 **Multi-Head Attention**이라 부른다.

비유하면, 영화 한 편을 여러 평론가가 동시에 분석하는 것이다:

- 평론가 A: 줄거리 구조에 집중
- 평론가 B: 배우들의 연기에 집중
- 평론가 C: 촬영 기법에 집중
- 평론가 D: 음악과 분위기에 집중

각 헤드가 문장의 다른 측면(문법 구조, 의미 관계, 위치 관계 등)을 포착하고, 최종적으로 이 정보를 결합한다.

### GPT 계보: 규모의 변화

GPT(Generative Pre-trained Transformer)는 OpenAI가 만든 모델 시리즈다. "사전 학습된(Pre-trained) Transformer로 텍스트를 생성(Generative)한다"는 뜻이다.

| 모델 | 연도 | 파라미터 수 | 핵심 변화 |
|------|------|-------------|-----------|
| GPT-1 | 2018 | 1.17억 | "Transformer로 사전학습하면 다양한 작업이 가능하다"는 것을 증명 |
| GPT-2 | 2019 | 15억 | 규모를 키우니 제로샷 능력이 등장 (학습 안 한 작업도 수행) |
| GPT-3 | 2020 | 1750억 | 인컨텍스트 러닝 — 프롬프트에 예시를 넣으면 따라 한다 |
| GPT-4 | 2023 | 비공개 (추정 1조+) | 멀티모달 (텍스트+이미지), 추론 능력 대폭 향상 |

핵심 교훈: **같은 구조에 데이터와 파라미터를 늘리면 질적으로 다른 능력이 창발한다.** 이것을 "스케일링 법칙(Scaling Law)"이라 부른다. GPT-2까지는 그냥 텍스트를 잘 생성하는 모델이었지만, GPT-3부터 "프롬프트만으로 새로운 작업을 수행"하는 능력이 나타났다.

### BERT vs GPT: 양방향 vs 단방향

Transformer 아키텍처를 활용하는 두 가지 주요 접근법이 있다.

**GPT 계열 (Decoder-only, 단방향):**

책을 앞에서부터 순서대로 읽으면서, **다음에 올 단어를 예측**하는 방식으로 학습한다. 이전 단어들만 볼 수 있다.

```
입력:  "오늘 날씨가 정말"
예측:  → "좋다" (다음 토큰)
```

- 텍스트 **생성**에 최적화
- ChatGPT, GPT-4, LLaMA, Mistral 등이 이 방식
- ATHENA에서 답변 생성에 사용

**BERT 계열 (Encoder-only, 양방향):**

문장의 일부를 가리고(마스킹), 양쪽 문맥을 모두 활용하여 **빈칸을 채우는** 방식으로 학습한다.

```
입력:  "오늘 [MASK]가 정말 좋다"
예측:  → "날씨" (가려진 토큰)
```

- 텍스트 **이해**에 최적화
- 분류, 감성 분석, 유사도 측정 등에 강함
- ATHENA에서 임베딩 모델로 활용 가능

| 특성 | GPT (단방향) | BERT (양방향) |
|------|-------------|---------------|
| 학습 방식 | 다음 토큰 예측 | 빈칸 채우기 |
| 문맥 활용 | 왼쪽(이전)만 | 양쪽 모두 |
| 강점 | 텍스트 생성 | 텍스트 이해/분류 |
| ATHENA 용도 | 답변 생성, 지식 추출 | 임베딩, 문서 분류 |

### LLaMA/Mistral: 오픈소스 LLM 생태계

GPT-4 같은 모델은 API로만 사용할 수 있고, 내부 구조도 비공개다. 하지만 2023년부터 **오픈소스 LLM**이 빠르게 발전하면서 상황이 바뀌었다.

**LLaMA (Meta)**

Meta가 공개한 오픈소스 LLM 시리즈. ATHENA가 Ollama로 로컬 실행하는 주요 모델이다.

| 버전 | 공개 연도 | 파라미터 | 특징 |
|------|-----------|----------|------|
| LLaMA 1 | 2023.02 | 7B~65B | 최초의 고성능 오픈소스 LLM |
| LLaMA 2 | 2023.07 | 7B~70B | 상업적 사용 허가, RLHF 적용 |
| LLaMA 3 | 2024.04 | 8B~70B | 토크나이저 개선, 성능 대폭 향상 |
| LLaMA 3.1 | 2024.07 | 8B~405B | 128K 컨텍스트, 다국어 강화 |

**Mistral**

프랑스 스타트업 Mistral AI가 만든 모델. 작은 크기 대비 높은 성능이 특징이다.

| 모델 | 파라미터 | 특징 |
|------|----------|------|
| Mistral 7B | 7B | 출시 당시 13B급 성능을 7B로 달성 |
| Mixtral 8x7B | 46.7B (활성 12.9B) | MoE(Mixture of Experts) 구조 |

**왜 오픈소스가 ATHENA에 중요한가?**

1. **무료**: API 비용이 들지 않는다 (우리 예산: 월 5만원)
2. **프라이버시**: 데이터가 외부 서버로 나가지 않는다
3. **커스터마이징**: 파인튜닝, 프롬프트 실험이 자유롭다
4. **오프라인**: 인터넷 없이도 동작한다

## 3. 토큰 생성 과정

### 토큰이란?

LLM은 "단어" 단위가 아니라 **"토큰"** 단위로 텍스트를 처리한다. 토큰은 단어보다 작을 수도, 같을 수도, 클 수도 있다.

```
영어: "Hello, world!" → ["Hello", ",", " world", "!"]  (4토큰)
한국어: "안녕하세요" → ["안", "녕", "하", "세요"]        (4토큰, 모델마다 다름)
코드: "print('hi')" → ["print", "('", "hi", "')"]      (4토큰)
```

한국어는 영어보다 같은 의미를 표현하는 데 더 많은 토큰이 필요하다. 이것이 한국어 처리 시 컨텍스트 길이가 더 빨리 소진되는 이유다. ATHENA에서 한국어 문서를 다룰 때 이 점을 고려해야 한다.

### 다음 토큰 예측 (Autoregressive Generation)

GPT 계열 LLM의 텍스트 생성 원리는 놀라울 정도로 단순하다. **한 번에 토큰 하나씩, 다음에 올 토큰의 확률을 예측**하는 것이 전부다.

비유하면, 문자 자동완성과 같다. 스마트폰에서 "오늘 점심"을 입력하면 "뭐", "은", "메뉴" 같은 후보가 나오는 것과 원리가 같다. 단, LLM은 이 자동완성을 **수십억 개의 파라미터**로 수행하기 때문에 훨씬 자연스럽고 맥락에 맞는 결과를 생성한다.

<div class="diagram-box">
  <div class="diagram-title">자기회귀적 토큰 생성 과정</div>
  <div class="step-list">
    <div class="step-item">
      <div class="step-num">1</div>
      <div class="step-title">"ATHENA는" →</div>
      <div class="step-desc">P(AI)=0.15, <strong>P(지식)=0.25</strong>, P(팀)=0.08, ... → <span class="kw">지식</span> 선택</div>
    </div>
    <div class="step-item">
      <div class="step-num">2</div>
      <div class="step-title">"ATHENA는 지식" →</div>
      <div class="step-desc"><strong>P(관리)=0.40</strong>, P(그래프)=0.30, ... → <span class="kw">관리</span> 선택</div>
    </div>
    <div class="step-item">
      <div class="step-num">3</div>
      <div class="step-title">"ATHENA는 지식 관리" →</div>
      <div class="step-desc"><strong>P(시스템)=0.55</strong>, P(도구)=0.15, ... → <span class="kw">시스템</span> 선택</div>
    </div>
  </div>
  <div class="callout callout-green" style="margin-top:0.75rem;">
    <strong>결과:</strong> "ATHENA는 <span class="kw">지식</span> <span class="kw">관리</span> <span class="kw">시스템</span>"
  </div>
</div>

이 과정을 **자기회귀적(autoregressive)** 생성이라 부른다. 자기가 생성한 토큰이 다음 입력이 되기 때문이다. 여기서 중요한 점 — **LLM은 전체 문장을 계획하고 쓰는 것이 아니다.** 한 토큰씩 순서대로 생성할 뿐이다. 그런데도 자연스러운 글이 나오는 이유는, 수십억 파라미터가 "이 맥락 다음에는 보통 무엇이 오는가"를 잘 학습했기 때문이다.

### temperature: 창의성 조절 다이얼

`temperature`는 토큰 선택의 **무작위성**을 조절하는 파라미터다.

비유하면, 식당에서 메뉴를 고르는 상황이다:

- **temperature = 0**: 항상 가장 인기 있는 메뉴만 시킨다. 예측 가능하고 안전하지만 지루하다.
- **temperature = 0.7**: 인기 메뉴를 주로 시키되, 가끔 새로운 메뉴도 시도한다.
- **temperature = 1.0**: 모든 메뉴를 원래 확률 그대로 고른다. 다양하지만 가끔 이상한 선택을 할 수 있다.
- **temperature = 2.0**: 거의 랜덤하게 고른다. 창의적이라기보다 혼란스럽다.

기술적으로, temperature는 확률 분포를 얼마나 "날카롭게" 또는 "평탄하게" 만들지 결정한다:

<div class="compare-grid" style="grid-template-columns:repeat(3,1fr);">
  <div class="compare-item compare-before">
    <div class="compare-label">temperature = 0.2 (날카로운)</div>
    "좋다" → <strong>0.85</strong> ⬅ 거의 확정<br>
    "덥다" → 0.10<br>
    "춥다" → 0.04<br>
    "이상하다" → 0.01
  </div>
  <div class="compare-item" style="border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:1rem;">
    <div class="compare-label" style="background:rgba(255,255,255,0.1);">temperature = 1.0 (원래)</div>
    "좋다" → <strong>0.45</strong><br>
    "덥다" → 0.25<br>
    "춥다" → 0.18<br>
    "이상하다" → 0.12
  </div>
  <div class="compare-item compare-after">
    <div class="compare-label">temperature = 2.0 (평탄한)</div>
    "좋다" → 0.30<br>
    "덥다" → 0.26<br>
    "춥다" → 0.23<br>
    "이상하다" → 0.21 ⬅ 거의 균등
  </div>
</div>

**ATHENA에서의 활용:**
- 지식 그래프 구축 (정확한 정보 추출): temperature 0~0.3
- 사용자 질문에 대한 답변 생성: temperature 0.5~0.7
- 브레인스토밍, 아이디어 생성: temperature 0.8~1.0

### top-p (Nucleus Sampling)

`top-p`는 temperature와 함께 사용되는 또 다른 샘플링 방법이다.

비유하면, 시험에서 **상위 몇 %의 학생만 합격**시키는 것과 같다. top-p = 0.9이면 확률 상위 90%에 해당하는 토큰들만 후보로 남기고 나머지는 제외한다.

```
"오늘 날씨가 정말" 다음 토큰:

전체 후보 (확률순):
  "좋다"     → 0.45  ─┐
  "덥다"     → 0.25  ─┤ 누적 0.88 (아직 0.9 미만)
  "춥다"     → 0.18  ─┤ 누적 1.00  ← 0.9 초과, 여기까지 포함? → 포함
  "이상하다"  → 0.07  ─┘ 제외
  "무섭다"   → 0.03     제외
  "아프다"   → 0.02     제외

top-p = 0.9 적용 후:
  "좋다"  → 후보 ✓
  "덥다"  → 후보 ✓
  "춥다"  → 후보 ✓  (누적이 0.9를 넘는 시점까지 포함)
  나머지  → 제외
```

**top-p의 장점:** temperature가 분포의 "날카로움"을 조절한다면, top-p는 **후보군의 크기**를 조절한다. 확률이 극히 낮은 (말이 안 되는) 토큰이 선택되는 것을 방지한다.

일반적인 조합:
- `temperature=0.7, top_p=0.9` — 균형 잡힌 기본값
- `temperature=0, top_p=1.0` — 결정적 출력 (항상 같은 결과)
- `temperature=1.0, top_p=0.5` — 창의적이되 후보를 줄여 안정성 확보

### Ollama에서 직접 실험하기

Ollama를 사용하면 로컬에서 이 모든 파라미터를 직접 실험해볼 수 있다.

**기본 실행:**

```bash
# 모델 다운로드 (최초 1회)
ollama pull llama3.2

# 대화 시작
ollama run llama3.2
```

**temperature 비교 실험:**

```bash
# temperature 0: 항상 같은 답변
ollama run llama3.2 --temperature 0 "ATHENA 프로젝트를 한 문장으로 설명해줘"
ollama run llama3.2 --temperature 0 "ATHENA 프로젝트를 한 문장으로 설명해줘"
# → 두 번 실행해도 결과가 동일하다

# temperature 1: 매번 다른 답변
ollama run llama3.2 --temperature 1 "ATHENA 프로젝트를 한 문장으로 설명해줘"
ollama run llama3.2 --temperature 1 "ATHENA 프로젝트를 한 문장으로 설명해줘"
# → 실행할 때마다 다른 표현이 나온다
```

**API로 세밀한 제어:**

```bash
# Ollama API를 직접 호출하여 temperature, top_p 조절
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "지식 그래프란?",
  "options": {
    "temperature": 0.3,
    "top_p": 0.9,
    "num_predict": 200
  },
  "stream": false
}'
```

**파라미터별 차이를 체감하는 실험:**

```bash
# 실험 1: temperature에 따른 변화
# 같은 프롬프트를 temperature만 바꿔서 3번씩 실행해보자

# 결정적 (temperature 0)
for i in 1 2 3; do
  echo "=== 시도 $i ==="
  ollama run llama3.2 --temperature 0 "비가 오면" 2>/dev/null
done

# 다양한 (temperature 1.5)
for i in 1 2 3; do
  echo "=== 시도 $i ==="
  ollama run llama3.2 --temperature 1.5 "비가 오면" 2>/dev/null
done
```

**모델 정보 확인:**

```bash
# 현재 설치된 모델 목록
ollama list

# 모델 상세 정보 (파라미터 수, 양자화 방식 등)
ollama show llama3.2

# 실행 중인 모델 확인
ollama ps
```

## 4. ATHENA 연결

### Ollama로 로컬 LLM 실행

ATHENA 개발 환경에서는 비용 절감과 프라이버시를 위해 Ollama로 로컬 LLM을 실행한다. 이제 이 과정에서 어떤 일이 일어나는지 이해할 수 있다.

<div class="diagram-box">
  <div class="diagram-title">LLM 질의 처리 과정</div>
  <div class="callout callout-blue" style="margin-bottom:0.75rem;">
    <strong>입력:</strong> "ATHENA에서 의사결정 기록은 어떻게 저장되나요?"
  </div>
  <div class="pipe-step">
    <div class="pipe-num">1</div>
    <div class="pipe-content"><strong>토큰화</strong><br>질문을 토큰으로 분할 → <span class="kw">ATHENA</span> <span class="kw">에서</span> <span class="kw">의사</span> <span class="kw">결정</span> ...</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">2</div>
    <div class="pipe-content"><strong>Transformer 처리</strong><br>Self-Attention으로 토큰 간 관계 파악 — "의사결정"과 "저장"에 높은 가중치</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">3</div>
    <div class="pipe-content"><strong>자기회귀적 생성</strong><br>다음 토큰을 하나씩 예측, temperature/top-p로 다양성 조절</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">4</div>
    <div class="pipe-content"><strong>디토큰화</strong><br>토큰을 다시 텍스트로 변환 → 최종 답변</div>
  </div>
</div>

### RAG에서의 프롬프트 → 생성 과정

ATHENA의 RAG 파이프라인에서 LLM은 마지막 단계를 담당한다. 전체 흐름을 Transformer 관점에서 다시 보자:

<div class="diagram-box">
  <div class="diagram-title">RAG 파이프라인에서 LLM의 역할</div>
  <div class="pipe-step">
    <div class="pipe-num">1</div>
    <div class="pipe-content"><strong>사용자 질문</strong><br>"의사결정 기록은 어떻게 저장되나요?"</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">2</div>
    <div class="pipe-content"><strong>벡터 검색</strong><br>관련 문서 청크 k개 검색</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">3</div>
    <div class="pipe-content"><strong>프롬프트 조합</strong><br>시스템: "당신은 ATHENA 지식 관리 시스템의 AI 어시스턴트입니다..."<br>컨텍스트: <span class="kw">청크 1</span> + <span class="kw">청크 2</span> + <span class="kw">청크 3</span><br>질문: "의사결정 기록은 어떻게 저장되나요?"</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">4</div>
    <div class="pipe-content"><strong>Transformer 처리</strong><br>전체 프롬프트를 Self-Attention으로 처리</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">5</div>
    <div class="pipe-content"><strong>토큰 생성</strong><br>temperature/top-p 설정에 따라 토큰을 하나씩 생성</div>
  </div>
  <div class="pipe-arrow">↓</div>
  <div class="pipe-step">
    <div class="pipe-num">6</div>
    <div class="pipe-content"><strong>답변 반환</strong><br>생성된 토큰을 디토큰화하여 최종 답변 텍스트로 변환</div>
  </div>
</div>

여기서 **컨텍스트 길이(context length)**가 중요해진다. Transformer는 입력된 전체 토큰에 대해 Self-Attention을 수행하므로, 프롬프트가 길수록 더 많은 계산이 필요하다. 모델마다 처리할 수 있는 최대 토큰 수가 정해져 있다:

| 모델 | 컨텍스트 길이 |
|------|---------------|
| LLaMA 3.2 (8B) | 128K 토큰 |
| Mistral 7B | 32K 토큰 |
| GPT-4o | 128K 토큰 |

RAG에서 검색 결과를 프롬프트에 넣을 때, 이 컨텍스트 길이를 초과하지 않도록 관리해야 한다. 특히 한국어는 같은 내용이라도 영어보다 더 많은 토큰을 소비하므로, 청크 수(k)를 적절히 조절해야 한다.

### LLM의 한계를 아는 것이 설계의 시작

Transformer 내부 동작을 이해하면, LLM의 한계도 명확히 보인다:

1. **환각(Hallucination)**: LLM은 "가장 확률 높은 다음 토큰"을 예측할 뿐이다. 학습 데이터에 없는 내용도 그럴듯하게 생성할 수 있다. → ATHENA에서 RAG로 해결: 검색된 실제 문서를 컨텍스트로 제공하여 근거 있는 답변을 유도한다.

2. **지식 커트오프**: 학습 시점 이후의 정보를 모른다. → Knowledge Graph에 최신 의사결정 기록을 저장하고 검색하여 제공한다.

3. **추론의 불안정성**: 같은 질문에 다른 답을 할 수 있다 (temperature > 0일 때). → 팩트 기반 질의에는 temperature를 낮추고, 분석 작업에는 적절히 올린다.

4. **긴 문맥에서의 성능 저하**: 프롬프트가 길어지면 중간 부분의 정보를 놓칠 수 있다 ("Lost in the Middle" 현상). → 청크 순서와 크기를 최적화하여 관련 정보가 프롬프트 앞뒤에 위치하도록 한다.

## 5. 체크포인트

이 글을 읽고 다음 질문에 답할 수 있는지 확인하자.

### 개념 확인

스스로 생각해본 뒤, 답을 펼쳐 확인하자.

<details>
<summary>Q1. RNN과 Transformer의 핵심 차이점은?</summary>

RNN은 단어를 **순차적으로** 하나씩 처리하므로 느리고, 긴 문장에서 앞부분 정보가 희석된다. Transformer는 어텐션으로 **모든 위치를 동시에(병렬)** 처리하므로 빠르고, 긴 문장에서도 앞뒤 관계를 직접 계산할 수 있다.

</details>

<details>
<summary>Q2. Self-Attention에서 Q, K, V의 역할은?</summary>

- **Query(Q)**: "나는 무엇을 찾고 있는가?" — 현재 단어의 질문
- **Key(K)**: "나는 무엇을 제공할 수 있는가?" — 각 단어의 라벨
- **Value(V)**: "내가 제공하는 실제 정보" — 각 단어의 내용

Q와 K를 비교하여 관련도 점수를 매기고, 그 점수에 따라 V를 가중 합산한다.

</details>

<details>
<summary>Q3. GPT와 BERT의 학습 방식 차이는?</summary>

- **GPT** (단방향): 이전 단어들만 보고 **다음 토큰을 예측** → 텍스트 생성에 강함
- **BERT** (양방향): 양쪽 문맥을 모두 보고 **가려진 빈칸을 채움** → 텍스트 이해/분류에 강함

</details>

<details>
<summary>Q4. LLaMA 같은 오픈소스 LLM이 ATHENA에 중요한 이유는?</summary>

1. API 비용이 들지 않는다 (월 예산 5만원 제약)
2. 데이터가 외부로 나가지 않아 프라이버시가 보장된다
3. 파인튜닝, 프롬프트 실험을 자유롭게 할 수 있다

</details>

### 파라미터 이해

<details>
<summary>Q5. temperature를 0으로 설정하면 출력이 어떻게 되는가?</summary>

항상 확률이 가장 높은 토큰만 선택하므로, 같은 입력에 대해 **매번 동일한 출력**이 나온다. 예측 가능하고 안정적이지만 다양성이 없다.

</details>

<details>
<summary>Q6. top-p = 0.5일 때 top-p = 0.95보다 출력이 어떻게 다른가?</summary>

top-p = 0.5는 확률 상위 50%에 해당하는 토큰만 후보로 남기므로 **보수적이고 안정적**인 출력이 나온다. top-p = 0.95는 후보군이 넓어져 **다양하지만 가끔 예상 밖의 표현**이 나올 수 있다.

</details>

<details>
<summary>Q7. 지식 추출 작업에 적합한 temperature 범위는?</summary>

**0~0.3**. 정확한 정보를 추출해야 하므로 무작위성을 최소화하고, 가장 확률 높은 토큰을 선택하게 한다.

</details>

### 실습 과제

- [ ] Ollama에서 LLaMA 3.2를 실행하고, temperature 0과 1로 같은 질문을 3번씩 해보자. 결과가 어떻게 다른가?
- [ ] Ollama API를 호출하여 top-p 값을 바꿔가며 실험해보자.
- [ ] `ollama show` 명령어로 모델의 파라미터 수와 컨텍스트 길이를 확인해보자.

### ATHENA 연결

<details>
<summary>Q8. RAG 파이프라인에서 LLM이 담당하는 단계는?</summary>

마지막 **생성(Generation)** 단계다. 검색된 문서 청크를 컨텍스트로 받아 프롬프트를 구성하고, 이를 바탕으로 사용자 질문에 대한 답변 텍스트를 생성한다.

</details>

<details>
<summary>Q9. 한국어 문서 처리 시 토큰 수가 영어보다 많아지는 이유는?</summary>

대부분의 토크나이저가 영어 중심 데이터로 학습되어, 영어 단어는 1토큰으로 처리되는 반면 한국어 음절은 더 작은 단위로 쪼개진다. 또한 한국어의 교착어 특성(조사/어미 변형)으로 인해 같은 의미의 텍스트도 더 많은 토큰을 소비한다.

</details>

<details>
<summary>Q10. 프롬프트에 넣을 수 있는 검색 결과 수(k)에 제한이 생기는 이유는?</summary>

모델마다 처리할 수 있는 최대 토큰 수(컨텍스트 길이)가 정해져 있다. 시스템 프롬프트 + 검색 결과 + 질문의 총 토큰이 이 한계를 초과하면 안 되므로, 넣을 수 있는 청크 수에 자연스러운 제한이 생긴다.

</details>
