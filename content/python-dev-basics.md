---
title: "Python 실무 기초"
description: "API 호출, 파일 I/O, JSON 처리, 비동기 기초. 실제 프로젝트에서 매일 쓰는 Python 패턴."
sources:
  - type: official-docs
    label: "Python 공식 문서"
    url: "https://docs.python.org/3.11/"
  - type: official-docs
    label: "httpx 공식 문서"
    url: "https://www.python-httpx.org/"
  - type: github
    label: "httpx (13k+ stars)"
    url: "https://github.com/encode/httpx"
youtube:
  - "xi0vhXFPegw"
---

> **25분 읽기** | 핵심: LLM API 호출, 문서 파일 처리, JSON 파싱 — ATHENA에서 매일 쓰는 Python 패턴을 익힌다.

## 1. 개요

ATHENA는 문서를 읽고, LLM에 API를 호출하고, 그 결과를 파싱해서 Knowledge Graph에 저장하는 시스템이다. 이 과정에서 반복적으로 등장하는 Python 패턴이 있다:

- **API 호출**: Ollama/OpenAI/Anthropic에 텍스트를 보내고 응답을 받는다
- **파일 I/O**: 문서를 읽고, 처리 결과를 저장한다
- **JSON 처리**: API 응답과 설정 파일은 대부분 JSON 형식이다
- **비동기 처리**: 여러 API 호출을 동시에 보내 처리 속도를 높인다

이 문서에서는 위 네 가지를 중심으로, 타입 힌트와 패키지 관리까지 다룬다. 모든 코드는 Python 3.11 기준이다.

## 2. 핵심 개념

### 2.1 API 호출 (requests / httpx)

LLM API는 HTTP 요청으로 통신한다. Python에서 HTTP 요청을 보내는 대표적인 라이브러리는 `requests`와 `httpx` 두 가지다.

#### requests — 가장 널리 쓰이는 HTTP 클라이언트

```bash
uv pip install requests
```

```python
import requests

# Ollama 로컬 API 호출 (POST)
response = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "llama3.2",
        "prompt": "Python이란 무엇인가?",
        "stream": False,
    },
)

# 응답 확인
print(response.status_code)  # 200이면 성공
data = response.json()       # JSON을 딕셔너리로 파싱
print(data["response"])      # LLM이 생성한 텍스트
```

#### httpx — 비동기 지원 + 더 현대적인 API

`httpx`는 `requests`와 거의 같은 인터페이스를 제공하면서, 비동기(`async`)까지 지원한다. ATHENA 프로젝트에서는 `httpx`를 권장한다.

```bash
uv pip install httpx
```

```python
import httpx

# 동기 방식 — requests와 사용법이 거의 같다
response = httpx.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "llama3.2",
        "prompt": "Knowledge Graph란?",
        "stream": False,
    },
    timeout=60.0,  # LLM 응답은 느릴 수 있으므로 타임아웃을 넉넉히
)

data = response.json()
print(data["response"])
```

#### 에러 처리

API 호출은 실패할 수 있다. 네트워크 문제, 서버 다운, 잘못된 요청 등. 항상 에러 처리를 해야 한다.

```python
import httpx

def call_llm(prompt: str, model: str = "llama3.2") -> str:
    """LLM API를 호출하고 응답 텍스트를 반환한다."""
    try:
        response = httpx.post(
            "http://localhost:11434/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=60.0,
        )
        response.raise_for_status()  # 4xx, 5xx 에러 시 예외 발생
        return response.json()["response"]

    except httpx.ConnectError:
        print("Ollama 서버에 연결할 수 없습니다. ollama serve가 실행 중인지 확인하세요.")
        return ""
    except httpx.TimeoutException:
        print("요청 시간이 초과되었습니다.")
        return ""
    except httpx.HTTPStatusError as e:
        print(f"HTTP 에러: {e.response.status_code}")
        return ""

# 사용
result = call_llm("ATHENA 프로젝트를 한 문장으로 설명해줘")
print(result)
```

#### OpenAI API 호출 예시

```python
import httpx

def call_openai(prompt: str, api_key: str) -> str:
    """OpenAI API를 호출한다. 비용이 발생하므로 주의."""
    response = httpx.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=30.0,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]
```

> 실제 프로젝트에서는 `openai` 공식 라이브러리나 `ollama` 라이브러리를 쓰면 더 편하다. 여기서는 HTTP 호출 원리를 이해하기 위해 직접 호출했다.

### 2.2 파일 I/O & JSON 처리

ATHENA에서 다루는 데이터: 텍스트 문서, JSON 설정, API 응답 캐시. 모두 파일 읽기/쓰기가 필요하다.

#### 텍스트 파일 읽기/쓰기

```python
from pathlib import Path

# --- 파일 읽기 ---
# pathlib을 쓰면 경로 처리가 깔끔하다 (OS 무관)
file_path = Path("data/documents/meeting_notes.txt")

# 방법 1: pathlib (권장)
content = file_path.read_text(encoding="utf-8")
print(content)

# 방법 2: open() (전통적 방식)
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# --- 파일 쓰기 ---
output_path = Path("data/output/result.txt")
output_path.parent.mkdir(parents=True, exist_ok=True)  # 디렉토리 없으면 생성

output_path.write_text("처리 결과입니다.", encoding="utf-8")
```

> `encoding="utf-8"`을 항상 명시하자. Windows에서는 기본 인코딩이 UTF-8이 아닐 수 있어서 한국어 텍스트가 깨질 수 있다.

#### 여러 파일 한꺼번에 읽기

```python
from pathlib import Path

data_dir = Path("data/documents")

# .txt 파일 전부 읽기
for txt_file in data_dir.glob("*.txt"):
    content = txt_file.read_text(encoding="utf-8")
    print(f"--- {txt_file.name} ({len(content)}자) ---")
    print(content[:100])  # 앞 100자만 미리보기

# 하위 디렉토리까지 재귀 탐색
for md_file in data_dir.rglob("*.md"):
    print(md_file)
```

#### JSON 읽기/쓰기

```python
import json
from pathlib import Path

# --- JSON 읽기 ---
config_path = Path("config.json")
config = json.loads(config_path.read_text(encoding="utf-8"))

print(config["model_name"])    # 딕셔너리처럼 접근
print(config.get("timeout", 30))  # 키가 없으면 기본값 30 반환

# --- JSON 쓰기 ---
result = {
    "query": "ATHENA란?",
    "answer": "의사결정 근거를 Knowledge Graph로 구조화하는 시스템",
    "sources": ["meeting_01.txt", "design_doc.md"],
    "confidence": 0.87,
}

output_path = Path("data/output/result.json")
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(
    json.dumps(result, ensure_ascii=False, indent=2),
    encoding="utf-8",
)
```

> `ensure_ascii=False`는 한국어를 유니코드 이스케이프(`\uD55C\uAE00`)로 바꾸지 않고 그대로 저장하는 옵션이다. 한국어 프로젝트에서는 반드시 사용하자.

#### API 응답을 파일로 캐싱

LLM API는 느리고, 비용이 든다. 같은 질문의 응답을 캐싱하면 재호출을 피할 수 있다.

```python
import json
import hashlib
from pathlib import Path

CACHE_DIR = Path("data/cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

def get_cache_path(prompt: str) -> Path:
    """프롬프트를 해시하여 캐시 파일 경로를 생성한다."""
    key = hashlib.sha256(prompt.encode()).hexdigest()[:16]
    return CACHE_DIR / f"{key}.json"

def call_llm_with_cache(prompt: str) -> str:
    """캐시가 있으면 캐시를 반환하고, 없으면 API를 호출한다."""
    cache_path = get_cache_path(prompt)

    # 캐시 히트
    if cache_path.exists():
        cached = json.loads(cache_path.read_text(encoding="utf-8"))
        print(f"캐시 사용: {cache_path.name}")
        return cached["response"]

    # 캐시 미스 → API 호출
    response = call_llm(prompt)  # 앞에서 정의한 함수

    # 캐시 저장
    cache_path.write_text(
        json.dumps({"prompt": prompt, "response": response}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return response
```

### 2.3 비동기 기초 (async/await)

#### 동기 vs 비동기

동기(synchronous) 코드는 한 작업이 끝나야 다음 작업을 시작한다. LLM API 호출이 3초 걸린다면, 10개 문서를 처리하는 데 30초가 걸린다.

비동기(asynchronous) 코드는 응답을 기다리는 동안 다른 작업을 시작할 수 있다. 10개 호출을 동시에 보내면 약 3초에 끝난다.

```
동기:   [호출1 ████] [호출2 ████] [호출3 ████]  → 9초
비동기: [호출1 ████]
        [호출2 ████]                              → 3초
        [호출3 ████]
```

#### 기본 문법

```python
import asyncio

# async def로 비동기 함수를 정의한다
async def greet(name: str) -> str:
    print(f"{name}에게 인사 시작")
    await asyncio.sleep(1)  # 1초 대기 (네트워크 대기를 시뮬레이션)
    print(f"{name}에게 인사 완료")
    return f"안녕, {name}!"

# 비동기 함수는 await로 호출한다
async def main():
    result = await greet("ATHENA")
    print(result)

# 비동기 코드를 실행하는 진입점
asyncio.run(main())
```

#### 여러 작업 동시 실행

```python
import asyncio
import httpx

async def call_llm_async(client: httpx.AsyncClient, prompt: str) -> str:
    """비동기로 LLM API를 호출한다."""
    response = await client.post(
        "http://localhost:11434/api/generate",
        json={"model": "llama3.2", "prompt": prompt, "stream": False},
        timeout=60.0,
    )
    return response.json()["response"]

async def process_documents(prompts: list[str]) -> list[str]:
    """여러 프롬프트를 동시에 처리한다."""
    async with httpx.AsyncClient() as client:
        # asyncio.gather로 동시 실행
        tasks = [call_llm_async(client, p) for p in prompts]
        results = await asyncio.gather(*tasks)
        return results

# 실행
prompts = [
    "Python을 한 문장으로 설명해줘",
    "Knowledge Graph란 무엇인가?",
    "RAG의 핵심 원리를 설명해줘",
]
results = asyncio.run(process_documents(prompts))

for prompt, result in zip(prompts, results):
    print(f"Q: {prompt}")
    print(f"A: {result[:100]}...")
    print()
```

> Jupyter Notebook에서는 `asyncio.run()` 대신 `await`를 셀에서 직접 사용할 수 있다. (`await process_documents(prompts)`)

#### 동시 요청 수 제한

서버에 요청을 한꺼번에 너무 많이 보내면 과부하가 걸린다. `asyncio.Semaphore`로 동시 요청 수를 제한한다.

```python
import asyncio
import httpx

async def call_with_limit(
    sem: asyncio.Semaphore,
    client: httpx.AsyncClient,
    prompt: str,
) -> str:
    async with sem:  # 세마포어가 허용할 때까지 대기
        response = await client.post(
            "http://localhost:11434/api/generate",
            json={"model": "llama3.2", "prompt": prompt, "stream": False},
            timeout=60.0,
        )
        return response.json()["response"]

async def process_batch(prompts: list[str], max_concurrent: int = 3) -> list[str]:
    """최대 max_concurrent개의 요청만 동시에 실행한다."""
    sem = asyncio.Semaphore(max_concurrent)
    async with httpx.AsyncClient() as client:
        tasks = [call_with_limit(sem, client, p) for p in prompts]
        return await asyncio.gather(*tasks)
```

### 2.4 타입 힌트

타입 힌트는 변수나 함수의 타입을 명시하는 기능이다. 실행에는 영향이 없지만, IDE가 자동완성과 오류 탐지를 해주므로 팀 프로젝트에서 생산성이 크게 올라간다.

#### 기본 문법

```python
# 변수 타입
name: str = "ATHENA"
version: int = 2
threshold: float = 0.85
is_ready: bool = True

# 리스트, 딕셔너리
documents: list[str] = ["doc1.txt", "doc2.txt"]
config: dict[str, int] = {"chunk_size": 500, "top_k": 5}

# None이 될 수 있는 값
result: str | None = None  # Python 3.10+ 문법
```

#### 함수 타입 힌트

```python
def search_documents(
    query: str,
    top_k: int = 5,
    threshold: float = 0.7,
) -> list[dict[str, str]]:
    """문서를 검색하고 결과를 반환한다."""
    # ... 검색 로직 ...
    return [
        {"title": "회의록 01", "content": "..."},
        {"title": "설계 문서", "content": "..."},
    ]
```

#### TypedDict — 딕셔너리에 구조를 부여하기

API 응답처럼 정해진 구조의 딕셔너리에는 `TypedDict`가 유용하다.

```python
from typing import TypedDict

class SearchResult(TypedDict):
    title: str
    content: str
    score: float

class QueryResponse(TypedDict):
    query: str
    results: list[SearchResult]
    total_count: int

# IDE가 키 이름을 자동완성 해주고, 오타를 잡아준다
def format_response(response: QueryResponse) -> str:
    lines = [f"검색어: {response['query']}"]
    for r in response["results"]:
        lines.append(f"  - {r['title']} (유사도: {r['score']:.2f})")
    return "\n".join(lines)
```

### 2.5 패키지 관리 (uv)

ATHENA 프로젝트는 `uv`를 패키지 매니저로 사용한다. pip보다 10~100배 빠르고, 사용법은 거의 같다.

#### 기본 명령어

```bash
# 가상환경 생성
uv venv

# 가상환경 활성화
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# 패키지 설치
uv pip install httpx                    # 단일 패키지
uv pip install httpx ollama neo4j       # 여러 패키지
uv pip install -r requirements.txt      # 파일에서 설치

# 설치된 패키지 확인
uv pip list

# 패키지 제거
uv pip uninstall httpx
```

#### requirements.txt 관리

```bash
# 현재 설치된 패키지를 파일로 저장
uv pip freeze > requirements.txt
```

```
# requirements.txt 예시
httpx>=0.27.0
ollama>=0.4.0
neo4j>=5.0.0
python-dotenv>=1.0.0
```

#### 환경 변수 관리 (.env)

API 키 같은 민감 정보는 `.env` 파일에 저장하고, 절대 git에 커밋하지 않는다.

```bash
uv pip install python-dotenv
```

```
# .env (이 파일은 .gitignore에 추가)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
NEO4J_URI=bolt://localhost:7687
NEO4J_PASSWORD=your-password
```

```python
import os
from dotenv import load_dotenv

load_dotenv()  # .env 파일의 변수를 환경 변수로 로드

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY가 .env에 설정되지 않았습니다")

print(f"API 키 로드 완료: {api_key[:8]}...")  # 앞 8자만 확인
```

## 3. 실습: ATHENA 미니 파이프라인

지금까지 배운 패턴을 조합하여, 텍스트 파일을 읽고 LLM에 요약을 요청하는 미니 파이프라인을 만든다.

### 실습 준비

```bash
# 패키지 설치
uv pip install httpx python-dotenv

# Ollama 서버가 실행 중인지 확인
ollama list
```

### 전체 코드

```python
"""ATHENA 미니 파이프라인 — 문서를 읽고 LLM에 요약을 요청한다."""

import json
import asyncio
from pathlib import Path

import httpx


# --- 1단계: 문서 로드 ---
def load_documents(directory: str) -> list[dict[str, str]]:
    """디렉토리에서 텍스트 파일을 읽어 리스트로 반환한다."""
    docs: list[dict[str, str]] = []
    data_dir = Path(directory)

    if not data_dir.exists():
        print(f"디렉토리가 없습니다: {directory}")
        return docs

    for file_path in data_dir.glob("*.txt"):
        content = file_path.read_text(encoding="utf-8")
        docs.append({
            "filename": file_path.name,
            "content": content,
        })
        print(f"로드 완료: {file_path.name} ({len(content)}자)")

    return docs


# --- 2단계: LLM 요약 (비동기) ---
async def summarize(
    client: httpx.AsyncClient,
    sem: asyncio.Semaphore,
    doc: dict[str, str],
) -> dict[str, str]:
    """문서 하나를 LLM으로 요약한다."""
    prompt = f"""다음 문서를 3줄로 요약하세요.

[문서: {doc['filename']}]
{doc['content'][:2000]}
"""

    async with sem:
        try:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": "llama3.2", "prompt": prompt, "stream": False},
                timeout=120.0,
            )
            response.raise_for_status()
            summary = response.json()["response"]
        except Exception as e:
            summary = f"요약 실패: {e}"

    return {
        "filename": doc["filename"],
        "summary": summary,
    }


async def summarize_all(docs: list[dict[str, str]]) -> list[dict[str, str]]:
    """모든 문서를 동시에 요약한다 (최대 2개 동시 실행)."""
    sem = asyncio.Semaphore(2)
    async with httpx.AsyncClient() as client:
        tasks = [summarize(client, sem, doc) for doc in docs]
        return await asyncio.gather(*tasks)


# --- 3단계: 결과 저장 ---
def save_results(results: list[dict[str, str]], output_path: str) -> None:
    """요약 결과를 JSON 파일로 저장한다."""
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"결과 저장 완료: {output_path}")


# --- 실행 ---
def main() -> None:
    # 1. 문서 로드
    docs = load_documents("data/documents")
    if not docs:
        print("처리할 문서가 없습니다.")
        return

    # 2. LLM 요약 (비동기)
    print(f"\n{len(docs)}개 문서 요약 시작...")
    results = asyncio.run(summarize_all(docs))

    # 3. 결과 저장
    save_results(results, "data/output/summaries.json")

    # 4. 결과 출력
    print("\n=== 요약 결과 ===")
    for r in results:
        print(f"\n[{r['filename']}]")
        print(r["summary"])


if __name__ == "__main__":
    main()
```

이 코드를 `mini_pipeline.py`로 저장하고, `data/documents/` 디렉토리에 텍스트 파일을 넣은 뒤 실행하면 된다.

```bash
# 테스트용 문서 생성
mkdir -p data/documents
echo "ATHENA 프로젝트는 의사결정 근거를 Knowledge Graph로 구조화하여 왜라는 질문에 인과 사슬로 응답하는 시스템이다." > data/documents/about.txt

# 실행
python mini_pipeline.py
```

## 4. 체크포인트

아래 질문에 답할 수 있으면 이 자료의 핵심을 이해한 것이다.

1. **`httpx.post()`에서 `json=` 파라미터와 `data=` 파라미터의 차이는 무엇인가?** `json=`은 딕셔너리를 자동으로 JSON 문자열로 변환하고 `Content-Type: application/json` 헤더를 설정한다. `data=`는 문자열이나 바이트를 그대로 보낸다. LLM API 호출에는 `json=`을 쓴다.

2. **`asyncio.gather()`는 무엇을 하는 함수인가?** 여러 비동기 작업(코루틴)을 동시에 실행하고, 모든 작업이 완료될 때까지 기다린 뒤 결과를 리스트로 반환한다. 10개의 API 호출을 순차가 아닌 병렬로 처리할 수 있다.

3. **`json.dumps()`에서 `ensure_ascii=False`를 빼면 어떤 일이 발생하는가?** 한국어 텍스트가 `\uD55C\uAD6D\uC5B4`처럼 유니코드 이스케이프 시퀀스로 변환된다. 파일을 열었을 때 사람이 읽을 수 없게 되므로, 한국어 프로젝트에서는 반드시 `ensure_ascii=False`를 사용한다.

---

## 다음으로 읽을 자료
- [환경 세팅 가이드](/study/environment-setup) — Python, uv, Ollama 설치가 안 되어 있다면 먼저 환경을 세팅한다.
- [임베딩이란?](/study/embedding-concepts) — 텍스트를 벡터로 변환하는 임베딩의 원리와 활용법을 이해한다.
- [RAG 아키텍처 해부](/study/rag-architecture) — 이 문서의 패턴들이 실제로 어떻게 RAG 파이프라인에 결합되는지 본다.
