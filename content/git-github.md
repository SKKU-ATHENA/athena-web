---
title: "Git & GitHub 협업"
description: "브랜치 전략, PR 워크플로우, 충돌 해결. ATHENA 팀의 실제 협업 규칙과 연동."
sources:
  - type: official-docs
    label: "Git 공식 문서"
    url: "https://git-scm.com/doc"
  - type: official-docs
    label: "GitHub Docs"
    url: "https://docs.github.com"
youtube:
  - "HkdAHXoRtos"
---

> **20분 읽기** | 핵심: Git으로 코드 이력을 관리하고, GitHub으로 팀원과 협업하는 전체 흐름.

## 1. 개요: 왜 Git인가?

ATHENA 프로젝트는 6명이 동시에 코드를 작성한다. Git 없이 협업하면 어떤 일이 벌어지는가?

- "최종.py", "최종\_진짜최종.py", "최종\_이게진짜.py"가 카톡으로 오간다
- 누가 어떤 코드를 언제 바꿨는지 추적이 안 된다
- 두 명이 같은 파일을 동시에 수정하면 한쪽 작업이 소멸된다

Git은 이 문제를 근본적으로 해결한다:

1. **모든 변경 이력이 기록**된다 — 누가, 언제, 무엇을, 왜 바꿨는지
2. **브랜치**로 독립 작업 공간을 만든다 — 서로 간섭하지 않는다
3. **병합(merge)**으로 작업을 합친다 — 충돌이 발생하면 명확히 알려준다

GitHub은 Git 저장소를 호스팅하고, Pull Request(PR)라는 코드 리뷰 시스템을 제공한다. ATHENA의 모든 레포(`ATHENA_PROTOv1`, `ATHENA_v2`, `athena-web`)가 GitHub에 있다.

## 2. Git 기초

### 2.1 저장소 초기화 (init / clone)

새 프로젝트를 시작하거나, 기존 프로젝트를 가져오는 두 가지 방법이 있다.

```bash
# 새 프로젝트를 Git으로 관리 시작
mkdir my-project && cd my-project
git init

# 기존 GitHub 레포를 내 컴퓨터로 복제
git clone https://github.com/ATHENA-TEAM/athena-web.git
cd athena-web
```

`git clone`을 실행하면 원격 저장소(remote)의 모든 이력이 로컬에 복사된다. ATHENA 프로젝트에 참여할 때는 `clone`을 사용한다.

### 2.2 변경 추적 (status / add / commit)

Git의 핵심 사이클은 세 단계다:

```
[작업 디렉토리]  →  [스테이징 영역]  →  [커밋 이력]
   수정한 파일      git add로 올림     git commit으로 확정
```

```bash
# 현재 상태 확인 — 어떤 파일이 수정/추가/삭제되었는지 보여준다
git status

# 특정 파일을 스테이징에 올리기
git add main.py
git add utils/helper.py

# 변경된 파일 전부 올리기 (주의: .env 같은 민감 파일도 올라갈 수 있다)
git add .

# 커밋 — 스테이징에 올린 변경을 하나의 스냅샷으로 확정
git commit -m "feat: 지식 그래프 검색 API 추가"
```

> ⚠️ `git add .`은 편리하지만 위험하다. `.env` 파일이나 API 키가 포함된 파일이 함께 올라갈 수 있다. 가능하면 파일을 명시적으로 지정하고, `.gitignore`를 반드시 설정하자 (5.5절 참고).

### 2.3 원격 저장소와 동기화 (push / pull)

로컬 커밋을 GitHub에 올리고, 다른 팀원의 변경을 가져오는 명령이다.

```bash
# 내 커밋을 원격 저장소에 올리기
git push origin feature/graph-search

# 원격 저장소의 최신 변경을 가져와서 합치기
git pull origin main
```

`push`와 `pull`의 관계:

```
[내 로컬]  ──push──▶  [GitHub 원격 저장소]  ◀──push──  [팀원 로컬]
[내 로컬]  ◀──pull──  [GitHub 원격 저장소]  ──pull──▶  [팀원 로컬]
```

```bash
# 원격 저장소 정보 확인
git remote -v
# origin  https://github.com/ATHENA-TEAM/athena-web.git (fetch)
# origin  https://github.com/ATHENA-TEAM/athena-web.git (push)
```

### 2.4 이력 확인 (log / diff)

```bash
# 커밋 이력 보기
git log --oneline
# dafcadd feat: PROTOv1 프로토타입 iframe 임베드 페이지 추가
# 2f70b41 feat: 데모 페이지 디자인 종합 개선
# bcdb283 fix: 아키텍처/팀 페이지 검은 박스 컨테이너 제거

# 아직 커밋하지 않은 변경 내용 보기
git diff

# 특정 커밋의 변경 내용 보기
git diff abc1234 def5678
```

## 3. 브랜치 전략

### 3.1 브랜치란?

브랜치는 독립된 작업 라인이다. `main` 브랜치에서 분기해서 기능을 개발하고, 완료되면 다시 합친다.

```
main:           ─●──●──●──────────●── (안정 상태 유지)
                      \          /
feature/search:        ●──●──●──     (독립 작업 후 합치기)
```

```bash
# 현재 브랜치 확인
git branch
# * main

# 새 브랜치 만들고 이동
git checkout -b feature/graph-search

# 기존 브랜치로 이동
git checkout main

# 브랜치 목록 (원격 포함)
git branch -a
```

### 3.2 ATHENA 브랜치 규칙

ATHENA 프로젝트는 다음 브랜치 규칙을 따른다:

| 브랜치 | 용도 | 규칙 |
|--------|------|------|
| `main` | 안정 브랜치 | 직접 push 금지, PR 필수 |
| `feature/<설명>` | 기능 개발 | 기능 단위로 생성 |
| `fix/<설명>` | 버그 수정 | 버그 단위로 생성 |

**실제 예시**:

```bash
# 새 기능을 개발할 때
git checkout main
git pull origin main                  # 최신 상태로 업데이트
git checkout -b feature/notion-sync   # 브랜치 생성

# 작업 후 커밋
git add src/notion_client.py
git commit -m "feat: Notion API 연동 클라이언트 구현"
git push origin feature/notion-sync   # GitHub에 브랜치 올리기
```

```bash
# 버그를 수정할 때
git checkout main
git pull origin main
git checkout -b fix/embedding-dimension

# 수정 후 커밋
git add src/embeddings.py
git commit -m "fix: 임베딩 차원 불일치 수정"
git push origin fix/embedding-dimension
```

> ⚠️ `main` 브랜치에 직접 `push`하지 않는다. 반드시 브랜치를 만들고 PR을 통해 합친다.

### 3.3 왜 이렇게 하는가?

`main`에 직접 push하면 안정 코드가 망가질 수 있다. 브랜치를 쓰면:

1. 내 실험적 코드가 다른 팀원에게 영향을 주지 않는다
2. PR을 통해 코드를 검토한 후 합칠 수 있다
3. 문제가 생기면 해당 브랜치만 되돌리면 된다

## 4. PR(Pull Request) 워크플로우

### 4.1 PR이란?

Pull Request는 "내 브랜치의 변경을 main에 합쳐달라"는 요청이다. GitHub 웹에서 생성하고, 팀원이 코드를 확인한 후 합친다.

### 4.2 PR 생성 ~ 병합까지 전체 흐름

```
1. 브랜치에서 작업 완료
2. GitHub에 push
3. GitHub 웹에서 PR 생성
4. (선택) 팀원이 코드 리뷰
5. CI 통과 확인
6. Merge (합치기)
7. 브랜치 삭제
```

**단계별 상세**:

```bash
# 1~2. 작업 완료 후 push
git checkout feature/notion-sync
git add .
git commit -m "feat: Notion 페이지 동기화 구현"
git push origin feature/notion-sync
```

GitHub에 push하면 "Compare & pull request" 버튼이 나타난다. 클릭해서 PR을 생성한다.

PR 작성 시 포함할 내용:

- **제목**: 커밋 메시지와 동일한 형식 (예: `feat: Notion 페이지 동기화 구현`)
- **설명**: 무엇을 왜 변경했는지 간략히

### 4.3 머지 후 로컬 정리

PR이 병합된 후에는 로컬 브랜치를 정리한다:

```bash
# main으로 이동해서 최신 상태 가져오기
git checkout main
git pull origin main

# 병합 완료된 브랜치 삭제
git branch -d feature/notion-sync
```

### 4.4 ATHENA PR 규칙

- 제목은 커밋 메시지와 동일한 형식 (`<타입>: <설명>`)
- 리뷰는 선택 (비전공 팀원을 고려해 필수로 두지 않는다)
- merge 전 CI 통과 필수

## 5. 실전 상황 대응

### 5.1 충돌 해결 (Merge Conflict)

두 명이 같은 파일의 같은 부분을 수정하면 충돌이 발생한다. Git이 자동으로 합치지 못하는 경우다.

```bash
git pull origin main
# CONFLICT (content): Merge conflict in src/config.py
# Automatic merge failed; fix conflicts and then commit the result.
```

충돌이 발생한 파일을 열면 이런 형태가 보인다:

```python
def get_model():
<<<<<<< HEAD
    return "llama3.2"
=======
    return "llama3.1"
>>>>>>> origin/main
```

- `<<<<<<< HEAD` ~ `=======` 사이: 내가 변경한 내용
- `=======` ~ `>>>>>>> origin/main` 사이: 원격의 변경 내용

**해결 방법**:

1. 파일을 열어서 어떤 버전을 유지할지 결정한다
2. 충돌 마커(`<<<<<<<`, `=======`, `>>>>>>>`)를 모두 삭제한다
3. 올바른 코드만 남긴다

```python
# 해결 후 — 원하는 버전만 남긴다
def get_model():
    return "llama3.2"
```

```bash
# 해결한 파일을 스테이징에 올리고 커밋
git add src/config.py
git commit -m "fix: config.py 모델 버전 충돌 해결"
```

> 💡 충돌을 예방하는 가장 좋은 방법: `git pull`을 자주 해서 로컬을 최신 상태로 유지하는 것이다. 작업을 시작하기 전에 항상 `git pull origin main`을 실행하자.

### 5.2 실수 되돌리기

```bash
# 아직 커밋하지 않은 파일 변경을 되돌리기
git checkout -- src/config.py

# 스테이징에서 내리기 (변경 내용은 유지)
git reset HEAD src/config.py

# 마지막 커밋 메시지를 수정 (아직 push하지 않았을 때만!)
git commit --amend -m "fix: 올바른 커밋 메시지"
```

> ⚠️ `git commit --amend`는 이미 `push`한 커밋에는 사용하지 않는다. 다른 팀원의 이력과 꼬인다.

### 5.3 자주 쓰는 명령 요약

| 상황 | 명령 |
|------|------|
| 현재 상태 확인 | `git status` |
| 변경 내용 보기 | `git diff` |
| 파일 스테이징 | `git add <파일>` |
| 커밋 | `git commit -m "메시지"` |
| 원격에 올리기 | `git push origin <브랜치>` |
| 최신 변경 가져오기 | `git pull origin <브랜치>` |
| 브랜치 생성+이동 | `git checkout -b <브랜치명>` |
| 브랜치 이동 | `git checkout <브랜치명>` |
| 커밋 이력 보기 | `git log --oneline` |
| 브랜치 삭제 | `git branch -d <브랜치명>` |

### 5.4 작업 흐름 한눈에 보기

ATHENA 팀원의 일반적인 하루:

```bash
# 1. 작업 시작 — 최신 상태 동기화
git checkout main
git pull origin main

# 2. 작업 브랜치 생성
git checkout -b feature/my-task

# 3. 코딩...
# (파일 수정, 추가)

# 4. 변경 확인 후 커밋
git status
git diff
git add src/my_module.py tests/test_my_module.py
git commit -m "feat: 나의 기능 구현"

# 5. GitHub에 올리기
git push origin feature/my-task

# 6. GitHub 웹에서 PR 생성 → CI 통과 확인 → Merge

# 7. 로컬 정리
git checkout main
git pull origin main
git branch -d feature/my-task
```

### 5.5 .gitignore

Git이 추적하지 않을 파일을 지정하는 설정 파일이다. 프로젝트 루트에 `.gitignore` 파일을 만든다.

ATHENA 프로젝트에서 반드시 제외해야 하는 파일들:

```gitignore
# 환경 변수 (API 키가 포함됨!)
.env

# Python 캐시
__pycache__/
*.pyc

# 가상환경
.venv/

# IDE 설정
.vscode/
.idea/

# OS 파일
.DS_Store
Thumbs.db

# 의존성 디렉토리
node_modules/
```

> ⚠️ `.env` 파일에는 OpenAI, Anthropic 등의 API 키가 들어있다. 이 파일이 GitHub에 올라가면 전 세계에 API 키가 공개된다. 반드시 `.gitignore`에 포함시키자.

## 6. ATHENA 팀 규칙 연동

### 6.1 커밋 메시지 형식

ATHENA 프로젝트는 한국어 동사형 커밋 메시지를 사용한다:

```
<타입>: <설명>
```

| 타입 | 용도 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat: 지식 그래프 검색 API 추가` |
| `fix` | 버그 수정 | `fix: 임베딩 차원 불일치 수정` |
| `docs` | 문서 작성/수정 | `docs: M1 회의록 작성` |
| `refactor` | 코드 구조 개선 | `refactor: LLM 프로바이더 추상화 개선` |
| `chore` | 기타 잡일 | `chore: 의존성 업데이트` |

**좋은 커밋 메시지**:
```bash
git commit -m "feat: Neo4j 연동 쿼리 빌더 구현"
git commit -m "fix: 한글 토큰화 시 인코딩 에러 수정"
git commit -m "docs: 벡터 DB 비교 문서 작성"
```

**나쁜 커밋 메시지**:
```bash
git commit -m "수정"              # 무엇을 수정했는지 알 수 없다
git commit -m "asdf"              # 의미 없음
git commit -m "fix bug"           # 어떤 버그인지 알 수 없다
git commit -m "여러 가지 수정"     # 하나의 커밋에 여러 변경을 섞었다
```

> 💡 커밋은 하나의 논리적 변경 단위로 만든다. "검색 기능 추가"와 "버그 수정"은 별도 커밋으로 분리하자.

### 6.2 브랜치 이름 규칙

```bash
# 기능 개발
feature/graph-search
feature/notion-sync
feature/embedding-pipeline

# 버그 수정
fix/encoding-error
fix/dimension-mismatch
```

영문 소문자, 하이픈(`-`)으로 단어를 구분한다. 간결하고 명확하게 작성한다.

### 6.3 레포 구조와 각 레포의 역할

ATHENA 프로젝트는 기능별로 레포가 분리되어 있다:

```
Project_ATHENA/          ← 루트 (문서+설정)
├── ATHENA_PROTOv1/      ← 기존 프로토타입
├── ATHENA_v2/           ← M1 이후 본격 개발
├── athena-web/          ← 학습 웹사이트 (이 자료가 있는 곳)
└── shared/              ← 공통 리소스
```

각 레포에서 같은 브랜치/커밋 규칙을 따른다.

---

## 7. 체크포인트

다음 질문에 답할 수 있으면 Git 협업의 기본을 이해한 것이다.

**Q1.** ATHENA 프로젝트에서 새 기능을 개발하려고 한다. 브랜치 생성부터 PR 머지까지 실행해야 하는 Git 명령을 순서대로 나열하라.

<details>
<summary>정답 보기</summary>

```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
# (코딩)
git add <변경된 파일>
git commit -m "feat: 기능 설명"
git push origin feature/my-feature
# (GitHub에서 PR 생성 → CI 통과 → Merge)
git checkout main
git pull origin main
git branch -d feature/my-feature
```

</details>

**Q2.** 아래 커밋 메시지 중 ATHENA 규칙에 맞는 것과 맞지 않는 것을 구분하고 이유를 설명하라.

- (a) `feat: Notion 동기화 기능 추가`
- (b) `fixed stuff`
- (c) `refactor: LLM 응답 파싱 로직 분리`

<details>
<summary>정답 보기</summary>

- **(a) 적합** — `<타입>: <한국어 설명>` 형식을 따르고, 변경 내용이 명확하다.
- **(b) 부적합** — 타입 접두사가 없고, 영어이며, 무엇을 수정했는지 알 수 없다.
- **(c) 적합** — `refactor` 타입을 사용하고, 구체적인 변경 내용이 명시되어 있다.

</details>

**Q3.** 두 명이 같은 파일을 수정해서 충돌이 발생했다. 이 충돌을 해결하는 절차를 설명하라.

<details>
<summary>정답 보기</summary>

1. 충돌이 발생한 파일을 연다
2. `<<<<<<< HEAD`, `=======`, `>>>>>>> origin/main` 마커를 찾는다
3. 두 변경 중 어떤 것을 유지할지 (또는 두 변경을 합칠지) 결정한다
4. 충돌 마커를 모두 삭제하고, 올바른 코드만 남긴다
5. `git add <파일>` → `git commit -m "fix: 충돌 해결"` 로 커밋한다

예방법: 작업 시작 전 `git pull origin main`으로 최신 상태를 유지한다.

</details>
