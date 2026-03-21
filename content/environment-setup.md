---
title: "환경 세팅 가이드"
description: "Python 3.11, uv, Jupyter, Ollama 설치 및 설정"
sources:
  - type: github
    label: "astral-sh/uv (40k+ stars)"
    url: "https://github.com/astral-sh/uv"
  - type: github
    label: "ollama/ollama (130k+ stars)"
    url: "https://github.com/ollama/ollama"
  - type: official-docs
    label: "Python 공식 문서"
    url: "https://docs.python.org/3.11/"
youtube:
  - "hwDhO1GLb_4"
---

## 1. Python 3.11 설치

ATHENA 프로젝트는 Python 3.11을 사용한다.

### Windows

[python.org](https://www.python.org/downloads/release/python-3119/)에서 설치 파일을 다운로드한다. 설치 시 **"Add Python to PATH"** 체크를 반드시 할 것.

```bash
python --version
# Python 3.11.x
```

### macOS / Linux

```bash
# macOS (Homebrew)
brew install python@3.11

# Ubuntu/Debian
sudo apt update && sudo apt install python3.11 python3.11-venv
```

```bash
# 설치 확인
python3.11 --version  # Python 3.11.x가 나와야 함
```

## 2. uv 패키지 매니저

pip보다 10~100배 빠른 Python 패키지 매니저. Rust로 작성되었다.

### 설치

```bash
# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

```bash
# 설치 확인
uv --version  # uv 0.x.x가 나와야 함
```

### 기본 사용법

```bash
# 가상환경 생성 + 패키지 설치
uv venv
uv pip install chromadb sentence-transformers ollama

# requirements.txt에서 설치
uv pip install -r requirements.txt
```

## 3. Jupyter Notebook

```bash
uv pip install jupyter

# 실행
jupyter notebook
```

```bash
# 설치 확인
jupyter --version  # jupyter notebook 버전이 나와야 함
```

## 4. Ollama 설치

로컬에서 LLM을 실행하는 도구. 비용이 들지 않는다.

### 설치

[ollama.com](https://ollama.com/download)에서 OS에 맞는 설치 파일을 다운로드한다.

```bash
# 설치 확인
ollama --version  # ollama version 0.x.x가 나와야 함

# 모델 다운로드 (추천: llama3)
ollama pull llama3
```

> ⚠️ 모델 다운로드는 인터넷 속도에 따라 10~30분 소요될 수 있다.

```bash
# 임베딩 모델 다운로드
ollama pull nomic-embed-text
```

### Python에서 사용

```bash
uv pip install ollama
```

```python
import ollama

# 텍스트 생성
response = ollama.chat(model="llama3", messages=[
    {"role": "user", "content": "안녕하세요!"}
])
print(response["message"]["content"])

# 임베딩
embedding = ollama.embed(model="nomic-embed-text", input="안녕하세요")
print(f"벡터 차원: {len(embedding['embeddings'][0])}")
```

## 5. 프로젝트 환경 구성

```bash
# 프로젝트 디렉토리 생성
mkdir my-rag && cd my-rag

# 가상환경 생성
uv venv

# 활성화
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# 필수 패키지 설치
uv pip install jupyter ollama chromadb sentence-transformers numpy
```

이 세팅이 끝나면 사전 과제를 시작할 준비가 된 것이다.

---

## 다음으로 읽을 자료
- [임베딩이란?](/study/embedding-concepts) — 텍스트를 벡터로 변환하는 임베딩의 원리와 활용법을 이해한다.
- [사전 과제](/pre-assignment) — 환경 세팅을 마쳤다면 바로 실습 과제를 시작한다.
