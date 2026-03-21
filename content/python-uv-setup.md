---
title: "Python + uv 환경 세팅"
date: "2026-03-21"
author: "ATHENA 팀"
description: "Python 3.11과 uv 패키지 매니저로 개발 환경 구축하기"
---

## uv란?

[uv](https://github.com/astral-sh/uv)는 Rust로 작성된 초고속 Python 패키지 매니저입니다.
pip보다 10-100배 빠르며, pip 호환 인터페이스를 제공합니다.

## 설치

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

## 프로젝트 세팅

```bash
# 프로젝트 디렉토리로 이동
cd ATHENA_v2

# 가상환경 생성 (Python 3.11)
uv venv --python 3.11

# 가상환경 활성화
source .venv/bin/activate   # macOS/Linux
.venv\Scripts\activate      # Windows

# 의존성 설치
uv pip install -r requirements.txt
```

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `uv pip install <pkg>` | 패키지 설치 |
| `uv pip install -r requirements.txt` | 요구사항 파일 설치 |
| `uv pip freeze` | 설치된 패키지 목록 |
| `uv pip compile requirements.in` | 잠금 파일 생성 |

## .python-version 파일

프로젝트 루트에 `.python-version` 파일이 있으면 uv가 자동으로 해당 버전을 사용합니다.

```
3.11
```

## 팁

- **가상환경은 항상 활성화**: `uv`는 가상환경 없이도 동작하지만, 프로젝트 격리를 위해 권장
- **requirements.in 활용**: 직접 의존성은 `.in` 파일에, 잠금된 전체 목록은 `.txt`에 관리
- **캐시 공유**: uv는 글로벌 캐시를 사용하여 같은 패키지를 다시 다운로드하지 않음
