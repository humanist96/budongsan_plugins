# 튜터리얼 웹서비스 PRD

> 작성일: 2026-02-18
> 프로젝트: tutorial-viewer
> 상태: Draft

---

## 1. 개요

마크다운 기반 튜터리얼 시리즈를 인터랙티브 웹 환경에서 쉽게 따라할 수 있는 **범용 튜터리얼 뷰어 웹서비스**를 구축한다. `docs/` 디렉토리에 마크다운 파일을 넣으면 자동으로 구조화된 튜터리얼 사이트가 생성되는 **제로 설정(Zero-config)** 방식을 목표로 한다.

### 1.1 해결하려는 문제

| 문제 | 현재 상태 | 목표 |
|------|----------|------|
| 마크다운 가독성 한계 | 에디터/GitHub에서 원문 그대로 읽어야 함 | 시각적으로 구조화된 웹 UI |
| 단계별 진행 추적 불가 | 어디까지 했는지 수동으로 기억 | 체크포인트 기반 진행률 자동 추적 |
| 코드/프롬프트 복사 불편 | 마크다운 코드블록 수동 선택 복사 | 원클릭 복사 + 구문 강조 |
| 시리즈 탐색 어려움 | 파일명으로만 순서 파악 | 시리즈맵 + 선후관계 시각화 |
| 모바일 접근 불가 | 데스크톱 에디터 전용 | 반응형 웹 지원 |

### 1.2 핵심 원칙

1. **마크다운 우선(Markdown-first):** 별도 CMS 없이 마크다운 파일이 원본이자 데이터 소스
2. **범용성:** 부동산 튜터리얼뿐 아니라 어떤 주제의 마크다운 튜터리얼이든 렌더링 가능
3. **제로 설정:** `docs/` 폴더에 `.md` 파일만 넣으면 자동으로 사이트 생성
4. **정적 배포:** 빌드 결과물이 정적 HTML이므로 GitHub Pages, Vercel, Netlify 등에 즉시 배포
5. **오프라인 지원:** PWA로 네트워크 없이도 튜터리얼 열람 가능

---

## 2. 타겟 사용자

### 2.1 Primary: 튜터리얼 학습자

- 단계별 실습을 따라하며 학습하는 사용자
- 기술 수준: 초급~중급 (개발자 + 비개발자 혼재)
- 주요 니즈: 진행률 추적, 코드 복사, 모바일 접근

### 2.2 Secondary: 튜터리얼 작성자

- 마크다운으로 튜터리얼을 작성하는 테크니컬 라이터/개발자
- 주요 니즈: 프리뷰, 구조 검증, 배포 자동화

---

## 3. 마크다운 파싱 규칙

### 3.1 튜터리얼 자동 인식

웹서비스는 마크다운 파일의 **구조적 패턴**을 분석하여 메타데이터를 자동 추출한다. YAML 프론트매터가 있으면 우선 사용하고, 없으면 본문에서 추론한다.

#### 방법 A: YAML Frontmatter (선택사항)

```yaml
---
title: "아파트 실거래가 조회 및 시세 분석"
series: "부동산 투자 플러그인"
order: 1
difficulty: 초급
duration: "30-40분"
plugins:
  - mcp-kr-realestate
tags:
  - 실거래가
  - 아파트
  - 시세분석
---
```

#### 방법 B: 본문 자동 추론 (기본)

프론트매터 없이도 기존 마크다운 구조에서 메타데이터를 추출한다:

| 추출 대상 | 추론 규칙 | 예시 |
|----------|----------|------|
| 제목 | 첫 번째 `# ` 헤딩 | `# 튜터리얼 1: 아파트 실거래가 조회 및 시세 분석` |
| 시리즈 순서 | 파일명 또는 제목의 숫자 패턴 | `튜터리얼1_`, `Tutorial_01_` |
| 난이도 | `**난이도:**` 뒤의 텍스트 | `초급`, `중급`, `고급` |
| 소요 시간 | `**소요 시간:**` 뒤의 텍스트 | `약 30-40분` |
| 사용 플러그인 | `**사용 플러그인:**` 섹션의 목록 | `mcp-kr-realestate` |
| 단계(Step) | `## Step N:` 패턴의 헤딩 | `## Step 1: 지역 코드 이해하기` |
| 프롬프트 | `**프롬프트:**` 또는 `### 프롬프트` 다음 코드블록 | 자연어 프롬프트 텍스트 |
| 예상 결과 | `**예상 응답:**`, `**예상 결과:**` 다음 코드블록 | 출력 텍스트 |
| 다음 단계 | `## 다음 단계` 섹션의 링크 | 시리즈 내 다른 튜터리얼 링크 |
| 시리즈 그룹 | 파일명 접두사 또는 디렉토리 | `튜터리얼*_`, `tutorial/` |

### 3.2 콘텐츠 블록 타입 자동 분류

마크다운 코드블록을 용도별로 자동 분류하여 각각 다른 UI로 렌더링한다:

| 블록 타입 | 감지 규칙 | UI 처리 |
|----------|----------|---------|
| **프롬프트** | `프롬프트` 헤딩 직후 코드블록, 또는 자연어 문장 형태의 코드블록 | 프롬프트 카드 (보라색 테두리, 복사 버튼, "Claude에 입력" 아이콘) |
| **예상 결과** | `예상 응답`, `예상 결과` 직후 코드블록 | 접이식 출력 패널 (회색 배경, 기본 접힌 상태) |
| **설정 코드** | ` ```json `, ` ```yaml ` + "settings", "config", "env" 문맥 | 설정 파일 카드 (파일 경로 표시, 전체 복사 버튼) |
| **실행 코드** | ` ```bash `, ` ```shell ` | 터미널 블록 (검정 배경, `$` 프롬프트 스타일) |
| **소스 코드** | ` ```javascript `, ` ```python `, ` ```html `, ` ```css ` 등 | 코드 에디터 뷰 (줄번호, 구문 강조, 복사 버튼) |
| **일반 코드** | 그 외 코드블록 | 기본 코드 블록 (구문 강조 + 복사 버튼) |

### 3.3 테이블 자동 강화

| 마크다운 테이블 패턴 | 렌더링 방식 |
|---------------------|------------|
| 5행 이하 | 인라인 테이블 (그대로 표시) |
| 6-20행 | 정렬 가능 테이블 (헤더 클릭 정렬) |
| 20행 초과 | 페이지네이션 + 검색 필터 테이블 |
| 숫자 위주 데이터 | 숫자 우측 정렬 + 천 단위 콤마 자동 적용 |

---

## 4. 기능 요구사항

### 4.1 P0 — MVP (Must Have)

#### F1: 튜터리얼 목록 페이지

```
┌─────────────────────────────────────────────────────┐
│  📚 부동산 투자 플러그인 튜터리얼                        │
│  ─────────────────────────────────────────────────── │
│                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ 🟢 완료       │ │ 🔵 진행중     │ │ ⚪ 미시작     │ │
│  │ 1. 실거래가   │ │ 2. 매물 크롤링│ │ 3. 수익률    │ │
│  │ 조회 및 분석  │ │              │ │ 계산         │ │
│  │              │ │              │ │              │ │
│  │ 초급 · 30분  │ │ 중급 · 40분  │ │ 중급 · 50분  │ │
│  │ ████████ 100%│ │ ████░░░  57% │ │ ░░░░░░░   0% │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
│                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ ⚪ 미시작     │ │ ⚪ 미시작     │ │ ⚪ 미시작     │ │
│  │ 4. 거시경제   │ │ 5. 대시보드   │ │ 6. 지역비교  │ │
│  │ 상관분석     │ │ 구축         │ │ 리포트       │ │
│  │              │ │              │ │              │ │
│  │ 중고급 · 50분│ │ 중급 · 60분  │ │ 중고급 · 60분│ │
│  │ ░░░░░░░   0% │ │ ░░░░░░░   0% │ │ ░░░░░░░   0% │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────┘
```

- 시리즈별 그룹핑된 카드 그리드
- 각 카드: 제목, 난이도 배지, 소요 시간, 사용 플러그인 태그, 진행률 바
- 시리즈 순서대로 자동 정렬
- 필터: 난이도, 플러그인, 완료 상태

#### F2: 튜터리얼 뷰어 페이지

```
┌────────────────────────────────────────────────────────────────┐
│  ← 목록  │  1. 아파트 실거래가 조회 및 시세 분석  │  2/5 Steps  │
├──────────┬─────────────────────────────────────────────────────┤
│ 목차     │                                                     │
│          │  ## Step 2: 특정 단지 실거래가 조회                  │
│ ○ 개요   │                                                     │
│ ○ 사전준비│  다음 프롬프트를 Claude Code에 입력합니다:            │
│ ● Step 1 │  ┌───────────────────────────────────────┐          │
│ ◉ Step 2 │  │ 💬 Claude 프롬프트            [복사]   │          │
│ ○ Step 3 │  │                                       │          │
│ ○ Step 4 │  │ 강남구 대치동 은마아파트의 최근        │          │
│ ○ Step 5 │  │ 1년간 실거래가를 조회해줘              │          │
│ ○ 실전응용│  └───────────────────────────────────────┘          │
│ ○ 다음단계│                                                     │
│          │  ▶ 예상 결과 보기                                    │
│──────────│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐          │
│ 진행률   │  │ (접힌 상태 - 클릭 시 펼침)           │          │
│ ████░ 40%│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘          │
│          │                                                     │
│          │         ┌─────────┐  ┌─────────┐                   │
│          │         │ ← 이전  │  │ 다음 →  │                   │
│          │         └─────────┘  └─────────┘                   │
└──────────┴─────────────────────────────────────────────────────┘
```

- **좌측 사이드바:** 자동 생성 TOC (스크롤 동기화, 현재 위치 하이라이트)
- **본문 영역:** 마크다운 렌더링 + 블록 타입별 커스텀 UI
- **Step 네비게이션:** 이전/다음 Step 버튼, Step 간 진행률
- **스크롤 위치 기억:** 재방문 시 마지막 읽은 위치로 복원

#### F3: 프롬프트 카드

프롬프트 코드블록을 특별한 카드 UI로 렌더링:

- 보라색/파란색 좌측 테두리 + 말풍선 아이콘
- **[복사]** 버튼: 클릭 시 프롬프트 텍스트 클립보드 복사 → 토스트 알림 "복사됨!"
- 코드블록이 아닌 대화체 스타일로 렌더링 (고정폭 폰트 미사용)

#### F4: 코드 블록 강화

- **구문 강조:** Shiki 또는 Prism 기반 (json, bash, python, javascript, html, css 등)
- **복사 버튼:** 모든 코드블록 우측 상단에 복사 아이콘
- **파일 경로 표시:** 설정 코드의 경우 파일 경로 탭 (예: `.claude/settings.json`)
- **줄번호:** 소스 코드 블록에 줄번호 표시 (토글 가능)

#### F5: 진행률 추적

- `localStorage` 기반 진행 상태 저장 (서버 불필요)
- Step 단위 체크포인트: 각 Step 완료 시 체크 표시
- 튜터리얼 전체 진행률 퍼센트 바
- 시리즈 전체 진행률 대시보드

#### F6: 반응형 디자인

| 뷰포트 | 레이아웃 |
|--------|---------|
| Desktop (>1024px) | 사이드바 TOC + 본문 2컬럼 |
| Tablet (768-1024px) | TOC 토글 오버레이 + 본문 전체폭 |
| Mobile (<768px) | 하단 네비게이션 + 본문 전체폭, TOC는 햄버거 메뉴 |

### 4.2 P1 — Enhanced (Should Have)

#### F7: 검색

- 전문 검색 (Fuse.js 클라이언트 사이드 또는 Pagefind 정적 검색)
- 검색 결과: 파일명 + 매칭 컨텍스트 미리보기
- 단축키: `Ctrl+K` / `Cmd+K`로 검색창 열기

#### F8: 시리즈맵 시각화

```
[1.실거래가] → [2.매물크롤링] → [3.수익률계산] → [4.거시경제]
                                       ↓              ↓
                                [5.대시보드] ← ─ ─ ─ ─ ┘
                                       ↓
                                [6.지역비교] → [7.포트폴리오]
```

- 튜터리얼 간 선후관계를 시각적으로 표현
- `## 다음 단계` 섹션의 링크에서 관계 자동 추출
- 현재 진행 상태 반영 (완료=녹색, 진행중=파란색, 미시작=회색)

#### F9: 다크모드

- 시스템 설정 자동 감지 (`prefers-color-scheme`)
- 수동 토글 버튼
- 코드 블록 테마 연동 (Light: github-light, Dark: github-dark)

#### F10: 예상 결과 접이식 패널

- 기본 상태: 접힘 (사용자가 먼저 직접 시도하도록 유도)
- 클릭/탭으로 펼침
- 펼침 시 부드러운 슬라이드 애니메이션
- "직접 해보세요!" 힌트 표시

#### F11: 블록퀘이트 스타일링

마크다운 `>` 블록을 문맥에 따라 다르게 렌더링:

| 패턴 | 스타일 |
|------|--------|
| `> **참고:**` | 파란색 정보 박스 (ℹ️) |
| `> **주의:**` | 노란색 경고 박스 (⚠️) |
| `> **위험:**`, `> **경고:**` | 빨간색 위험 박스 (🚨) |
| `> **팁:**` | 초록색 팁 박스 (💡) |
| 그 외 | 기본 인용 스타일 |

### 4.3 P2 — Advanced (Nice to Have)

#### F12: PDF 내보내기

- 현재 튜터리얼을 PDF로 변환
- 인쇄 최적화 스타일시트

#### F13: 북마크 및 메모

- 특정 섹션에 개인 메모 추가
- 북마크한 프롬프트/코드블록 모아보기

#### F14: 다국어 지원

- `docs/ko/`, `docs/en/` 디렉토리 구조로 언어 분리
- 언어 전환 UI

#### F15: 튜터리얼 작성 가이드 CLI

- `npx tutorial-viewer init` — 프로젝트 초기화
- `npx tutorial-viewer dev` — 로컬 개발 서버
- `npx tutorial-viewer build` — 정적 사이트 빌드
- `npx tutorial-viewer validate` — 마크다운 구조 검증 (깨진 링크, 누락 메타데이터)

---

## 5. 기술 스택

### 5.1 프레임워크 선정

| 옵션 | 장점 | 단점 | 적합도 |
|------|------|------|--------|
| **Astro + Starlight** | 문서 사이트 특화, 마크다운 네이티브, 빠른 빌드 | 커스텀 UI 유연성 다소 제한 | ★★★★☆ |
| **Next.js (App Router)** | 풍부한 생태계, SSG 지원, React 기반 확장성 | 문서 특화 아님, 설정 필요 | ★★★★☆ |
| **VitePress** | Vue 기반, 문서 사이트 최적화, 빠름 | Vue 생태계 한정 | ★★★☆☆ |
| **Docusaurus** | 문서 사이트 실적, 플러그인 풍부 | 무겁고 커스터마이징 번거로움 | ★★★☆☆ |

**선정: Astro + 커스텀 컴포넌트**

선정 이유:
- 마크다운/MDX 파일을 콘텐츠 소스로 네이티브 지원
- 아일랜드 아키텍처로 최소한의 JS만 전송 (성능 최적)
- Starlight 없이 커스텀 레이아웃으로 튜터리얼 전용 UI 구현 가능
- 빌드 결과물이 순수 정적 HTML (GitHub Pages 즉시 배포)
- React/Vue/Svelte 컴포넌트를 필요한 곳에만 섬(Island)으로 삽입

### 5.2 기술 스택 상세

```
프레임워크:    Astro v5
UI 컴포넌트:  React (아일랜드) — 인터랙티브 요소에만 사용
스타일링:     Tailwind CSS v4
마크다운:     remark + rehype 파이프라인
  - remark-gfm              (GitHub Flavored Markdown)
  - rehype-shiki            (구문 강조)
  - rehype-autolink-headings (헤딩 앵커 링크)
  - 커스텀 rehype 플러그인    (프롬프트/결과 블록 변환)
검색:         Pagefind (빌드 시 인덱스 생성, 클라이언트 사이드 검색)
진행률 저장:   localStorage (서버 불필요)
배포:         GitHub Pages / Vercel / Netlify (정적)
패키지 관리:   pnpm
```

### 5.3 커스텀 Remark/Rehype 플러그인

마크다운 파싱 시 튜터리얼 특화 변환을 수행하는 커스텀 플러그인:

```
rehype-tutorial-blocks
├── 프롬프트 감지 → <PromptCard> 컴포넌트로 변환
├── 예상 결과 감지 → <CollapsibleOutput> 컴포넌트로 변환
├── 설정 코드 감지 → <ConfigBlock> 컴포넌트로 변환
├── 터미널 코드 감지 → <TerminalBlock> 컴포넌트로 변환
└── 블록퀘이트 감지 → <Callout type="info|warn|danger|tip"> 변환

remark-tutorial-meta
├── 프론트매터 없을 시 본문에서 메타데이터 추출
├── Step 헤딩 파싱 → steps[] 배열 생성
└── 다음 단계 링크 파싱 → relations[] 생성
```

---

## 6. 디렉토리 구조

```
tutorial-viewer/
├── astro.config.mjs           # Astro 설정 + 마크다운 플러그인
├── package.json
├── tailwind.config.mjs
├── tsconfig.json
│
├── content/                    # 튜터리얼 마크다운 원본 (docs/에서 복사 또는 심링크)
│   └── tutorials/
│       ├── 튜터리얼1_아파트_실거래가_조회_및_시세분석.md
│       ├── 튜터리얼2_웹크롤링으로_부동산_매물_탐색.md
│       └── ...
│
├── src/
│   ├── components/
│   │   ├── tutorial/
│   │   │   ├── PromptCard.tsx         # 프롬프트 카드 (복사 버튼 포함)
│   │   │   ├── CollapsibleOutput.tsx  # 예상 결과 접이식 패널
│   │   │   ├── ConfigBlock.tsx        # 설정 파일 블록
│   │   │   ├── TerminalBlock.tsx      # 터미널 명령 블록
│   │   │   ├── CodeBlock.tsx          # 코드 블록 (줄번호 + 복사)
│   │   │   ├── Callout.tsx            # 정보/경고/팁 박스
│   │   │   ├── StepNavigation.tsx     # 이전/다음 Step 버튼
│   │   │   └── TableOfContents.tsx    # 스크롤 동기화 TOC
│   │   ├── series/
│   │   │   ├── SeriesCard.tsx         # 튜터리얼 카드 (진행률 포함)
│   │   │   ├── SeriesGrid.tsx         # 카드 그리드
│   │   │   ├── SeriesMap.tsx          # 시리즈맵 시각화
│   │   │   └── ProgressDashboard.tsx  # 시리즈 진행률 대시보드
│   │   ├── search/
│   │   │   └── SearchDialog.tsx       # Cmd+K 검색 다이얼로그
│   │   └── common/
│   │       ├── ThemeToggle.tsx        # 다크모드 토글
│   │       ├── CopyButton.tsx         # 범용 복사 버튼
│   │       └── Toast.tsx              # 토스트 알림
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro           # 기본 레이아웃 (헤더, 푸터)
│   │   └── TutorialLayout.astro       # 튜터리얼 페이지 레이아웃 (TOC + 본문)
│   │
│   ├── pages/
│   │   ├── index.astro                # 홈 (시리즈 목록)
│   │   └── [slug].astro               # 개별 튜터리얼 페이지 (동적 라우팅)
│   │
│   ├── plugins/
│   │   ├── remark-tutorial-meta.ts    # 메타데이터 자동 추출
│   │   └── rehype-tutorial-blocks.ts  # 콘텐츠 블록 변환
│   │
│   ├── lib/
│   │   ├── progress.ts                # localStorage 진행률 관리
│   │   ├── parser.ts                  # 마크다운 메타데이터 파서
│   │   └── series.ts                  # 시리즈 관계 계산
│   │
│   └── styles/
│       ├── global.css                 # 글로벌 스타일
│       ├── tutorial.css               # 튜터리얼 본문 스타일
│       └── code-theme.css             # 코드 블록 테마
│
├── public/
│   ├── favicon.svg
│   └── og-image.png
│
└── scripts/
    ├── sync-docs.sh                   # docs/ → content/ 동기화
    └── validate.ts                    # 마크다운 구조 검증 스크립트
```

---

## 7. 데이터 모델

### 7.1 Tutorial (파싱 결과)

```typescript
interface Tutorial {
  slug: string               // URL 경로 (파일명 기반)
  title: string              // 튜터리얼 제목
  seriesName: string         // 시리즈 그룹명
  order: number              // 시리즈 내 순서
  difficulty: '초급' | '중급' | '중급-고급' | '고급'
  duration: string           // 소요 시간 ("30-40분")
  plugins: string[]          // 사용 플러그인 목록
  description: string        // 개요 첫 문장
  steps: Step[]              // 단계 목록
  prerequisites: string[]    // 선수 튜터리얼 slugs
  nextTutorials: string[]    // 다음 튜터리얼 slugs
  headings: Heading[]        // TOC용 헤딩 트리
  rawContent: string         // 마크다운 원문
}

interface Step {
  id: string                 // "step-1", "step-2" ...
  number: number             // Step 번호
  title: string              // Step 제목
  headingId: string          // 앵커 링크용 ID
}

interface Heading {
  depth: number              // 헤딩 레벨 (1-6)
  text: string               // 헤딩 텍스트
  id: string                 // 앵커 ID
  children: Heading[]        // 하위 헤딩
}
```

### 7.2 Progress (localStorage)

```typescript
interface UserProgress {
  version: number                           // 스키마 버전 (마이그레이션용)
  tutorials: Record<string, TutorialProgress>
  lastVisited: string                       // 마지막 방문 slug
  lastUpdated: string                       // ISO 타임스탬프
}

interface TutorialProgress {
  completedSteps: string[]                  // 완료한 Step ID 목록
  scrollPosition: number                    // 마지막 스크롤 위치
  lastVisited: string                       // 마지막 방문 타임스탬프
  bookmarks: Bookmark[]                     // 북마크 목록
  notes: Note[]                             // 개인 메모
}
```

---

## 8. 핵심 UX 상세

### 8.1 프롬프트 카드 인터랙션

```
사용자 흐름:
1. 튜터리얼 페이지에서 프롬프트 카드를 발견
2. [복사] 버튼 클릭
3. 클립보드에 프롬프트 텍스트 복사됨
4. 토스트: "프롬프트가 복사되었습니다. Claude Code에 붙여넣으세요!"
5. 사용자가 터미널의 Claude Code에 붙여넣기
6. 결과 확인 후 [예상 결과 보기] 클릭하여 비교
```

### 8.2 Step 완료 체크포인트

```
사용자 흐름:
1. Step 2 섹션을 스크롤하며 읽음
2. Step 2 끝에 도달하면 "이 단계를 완료했습니다" 체크박스 표시
3. 체크 시:
   - TOC의 Step 2 아이콘이 ● → ✓ 변경
   - 진행률 바 업데이트
   - localStorage 저장
4. 다음 방문 시 진행 상태 복원
```

### 8.3 모바일 제스처

- **좌우 스와이프:** 이전/다음 Step 이동
- **우측 가장자리 스와이프:** TOC 사이드바 열기
- **하단 고정 바:** 진행률 + 이전/다음 버튼

---

## 9. 구현 계획

### Phase 1: MVP (1주차)

**목표:** 마크다운 파싱 → 기본 렌더링 → 배포

| 작업 | 산출물 | 우선순위 |
|------|--------|----------|
| Astro 프로젝트 초기화 | 프로젝트 보일러플레이트 | P0 |
| remark-tutorial-meta 플러그인 | 메타데이터 자동 추출 | P0 |
| rehype-tutorial-blocks 플러그인 | 블록 타입별 변환 | P0 |
| TutorialLayout + TOC | 기본 튜터리얼 뷰어 | P0 |
| PromptCard, CodeBlock | 프롬프트/코드 UI | P0 |
| SeriesGrid (목록 페이지) | 튜터리얼 카드 목록 | P0 |
| 반응형 CSS | 모바일/태블릿 대응 | P0 |
| GitHub Pages 배포 | CI/CD 파이프라인 | P0 |

### Phase 2: Enhanced (2주차)

**목표:** 인터랙티브 기능 + 진행률 추적

| 작업 | 산출물 | 우선순위 |
|------|--------|----------|
| 진행률 추적 (localStorage) | Step 체크포인트, 진행률 바 | P1 |
| CollapsibleOutput | 예상 결과 접이식 패널 | P1 |
| Pagefind 검색 통합 | Cmd+K 검색 | P1 |
| 다크모드 | 테마 토글 + 코드 테마 연동 | P1 |
| Callout 스타일링 | 참고/주의/팁 박스 | P1 |
| 테이블 정렬/필터 | 인터랙티브 테이블 | P1 |

### Phase 3: Advanced (3주차)

**목표:** 시리즈맵 + 부가 기능

| 작업 | 산출물 | 우선순위 |
|------|--------|----------|
| SeriesMap 시각화 | 튜터리얼 관계도 | P2 |
| PDF 내보내기 | 인쇄 최적화 | P2 |
| 북마크/메모 | 개인 학습 노트 | P2 |
| PWA 오프라인 지원 | Service Worker | P2 |
| CLI 도구 | init/dev/build/validate | P2 |
| 다국어 지원 | i18n 라우팅 | P2 |

---

## 10. 성능 목표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| Lighthouse Performance | ≥ 95 | Chrome Lighthouse |
| First Contentful Paint | < 1.0s | Web Vitals |
| Largest Contentful Paint | < 1.5s | Web Vitals |
| Total Blocking Time | < 100ms | Web Vitals |
| Cumulative Layout Shift | < 0.05 | Web Vitals |
| 빌드 시간 (7개 튜터리얼) | < 10s | `astro build` |
| 번들 크기 (JS) | < 50KB gzipped | 빌드 분석 |
| 검색 응답 시간 | < 50ms | Pagefind 벤치마크 |

---

## 11. 배포 전략

### 11.1 GitHub Pages (기본)

```yaml
# .github/workflows/deploy.yml
name: Deploy Tutorial Site
on:
  push:
    branches: [main]
    paths: ['docs/**', 'tutorial-viewer/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm run sync-docs    # docs/ → content/ 동기화
      - run: pnpm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

### 11.2 자동 동기화

`docs/` 디렉토리의 마크다운 파일이 업데이트되면 자동으로:
1. `scripts/sync-docs.sh`가 `content/tutorials/`에 복사
2. `scripts/validate.ts`가 구조 검증 (깨진 링크, 누락 메타)
3. Astro 빌드 → 정적 사이트 생성
4. GitHub Pages 자동 배포

---

## 12. 범용성 확보 방안

이 웹서비스가 부동산 튜터리얼에만 국한되지 않고 어떤 마크다운 튜터리얼에도 적용 가능하도록 하는 설계:

### 12.1 설정 파일 (`tutorial.config.ts`)

```typescript
import { defineConfig } from './src/lib/config'

export default defineConfig({
  // 사이트 기본 정보
  site: {
    title: '부동산 투자 플러그인 튜터리얼',
    description: 'Claude Code MCP 플러그인을 활용한 부동산 투자 분석 가이드',
    logo: '/logo.svg',
  },

  // 콘텐츠 소스
  content: {
    dir: './content/tutorials',        // 마크다운 디렉토리
    glob: '**/*.md',                   // 파일 패턴
  },

  // 시리즈 감지 규칙
  series: {
    // 파일명에서 시리즈와 순서를 추출하는 패턴
    pattern: /^(?<series>.+?)(?<order>\d+)_(?<slug>.+)\.md$/,
    // 또는 디렉토리 기반: 'directory'
    groupBy: 'filename-prefix',
  },

  // 메타데이터 추출 규칙 (언어/컨벤션별 커스터마이징)
  meta: {
    difficulty: { label: '난이도', pattern: /\*\*난이도:\*\*\s*(.+)/ },
    duration:   { label: '소요 시간', pattern: /\*\*소요 시간:\*\*\s*(.+)/ },
    plugins:    { label: '사용 플러그인', pattern: /\*\*사용 플러그인:\*\*/ },
    step:       { pattern: /^##\s+Step\s+(\d+):?\s*(.+)/ },
  },

  // UI 커스터마이징
  theme: {
    primaryColor: '#3B82F6',
    accentColor: '#8B5CF6',
    codeTheme: { light: 'github-light', dark: 'github-dark' },
  },

  // 프롬프트 카드 설정
  promptCard: {
    // 프롬프트 블록을 감지하는 패턴
    headingPatterns: ['프롬프트', 'Prompt', 'Claude 프롬프트'],
    icon: '💬',
    copyLabel: '복사',
    copySuccessMessage: '프롬프트가 복사되었습니다!',
  },
})
```

### 12.2 다른 도메인 적용 예시

| 도메인 | 설정 변경 사항 |
|--------|-------------|
| **AI 개발 튜터리얼** | `meta.plugins → meta.tools`, Step 패턴 영어로 변경 |
| **요리 레시피** | `meta.step → /^##\s+(\d+)단계/`, difficulty → '쉬움/보통/어려움' |
| **DevOps 가이드** | 프롬프트 카드 → "터미널에 입력", 영어 기반 파싱 |
| **학습 코스웨어** | 퀴즈 블록 추가, 점수 시스템 연동 |

### 12.3 플러그인 확장 포인트

```typescript
// 커스텀 블록 타입 추가 예시
export const quizBlock = {
  name: 'quiz',
  detect: (node) => node.tagName === 'blockquote'
    && node.children[0]?.value?.startsWith('퀴즈:'),
  component: 'QuizBlock',
}
```

---

## 13. 테스트 전략

| 테스트 종류 | 대상 | 도구 |
|------------|------|------|
| 단위 테스트 | remark/rehype 플러그인, 파서, 유틸리티 | Vitest |
| 컴포넌트 테스트 | PromptCard, CodeBlock 등 React 컴포넌트 | Testing Library |
| E2E 테스트 | 전체 페이지 렌더링, 네비게이션, 진행률 | Playwright |
| 시각적 회귀 | 레이아웃, 코드 블록, 다크모드 | Playwright screenshots |
| 접근성 | WCAG 2.1 AA 준수 | axe-core |
| 빌드 검증 | 깨진 링크, 메타 누락, HTML 유효성 | 커스텀 validate 스크립트 |

### 13.1 핵심 E2E 시나리오

```
1. 홈 → 튜터리얼 카드 클릭 → 튜터리얼 뷰어 진입 → TOC 확인
2. 프롬프트 카드 [복사] → 클립보드 확인 → 토스트 표시
3. Step 1 완료 체크 → 진행률 바 업데이트 → 새로고침 후 상태 유지
4. Cmd+K → 검색어 입력 → 결과 클릭 → 해당 섹션 이동
5. 다크모드 토글 → 코드 블록 테마 변경 확인
6. 모바일 뷰포트 → 햄버거 메뉴 → TOC 오버레이
```

---

## 14. 성공 지표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 마크다운 파싱 정확도 | 100% (7개 튜터리얼 기준) | 모든 블록 타입 올바르게 변환 |
| 프롬프트 카드 감지율 | ≥ 95% | 전체 프롬프트 중 자동 감지 비율 |
| 페이지 로드 시간 | < 1.5s (LCP) | Lighthouse 측정 |
| 모바일 사용성 | Lighthouse Accessibility ≥ 90 | Lighthouse 측정 |
| 정적 빌드 성공률 | 100% | CI/CD 파이프라인 |
| 브라우저 호환성 | Chrome, Safari, Firefox, Edge 최신 2버전 | E2E 테스트 |

---

## 15. 참고 자료

- [Astro Documentation](https://docs.astro.build/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Pagefind - Static search](https://pagefind.app/)
- [Shiki - Syntax highlighter](https://shiki.style/)
- [Tailwind CSS](https://tailwindcss.com/)
- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
