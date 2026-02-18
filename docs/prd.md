# 부동산 투자 분석 플러그인 시스템 PRD

> 작성일: 2026-02-18
> 프로젝트: budongsan_plugins

---

## 1. 개요

Claude Code의 플러그인/MCP 생태계를 활용하여 **한국 부동산 투자 분석**에 필요한 데이터 수집, 시장 분석, 재무 평가, 리포트 생성 워크플로우를 구축한다.

### 1.1 목표

- 실거래가/공시지가 등 한국 부동산 공공데이터를 Claude에서 직접 조회
- 금리, GDP 등 거시경제 지표와 부동산 시장 상관분석
- 매물 탐색 -> 투자 분석 -> 의사결정 리포트까지 원스톱 워크플로우 구현
- 웹 크롤링을 통한 최신 시장 동향 수집 자동화

---

## 2. 조사 결과: 활용 가능한 플러그인 및 MCP 서버

### 2.1 핵심 (Tier 1) — 부동산 직접 관련

| 이름 | 출처 | 설명 | 우선순위 |
|------|------|------|----------|
| **mcp-kr-realestate** | [ChangooLee/mcp-kr-realestate](https://github.com/ChangooLee/mcp-kr-realestate) | 한국 부동산 투자 분석 전용 MCP 서버. 국토교통부 실거래가 API, 한국은행 경제지표 통합. 아파트 매매 실거래가 수집, 캐시 관리, 자동 리포트 생성 | **P0** |
| **real-estate-mcp** | [agentic-ops/real-estate-mcp](https://github.com/agentic-ops/real-estate-mcp) | 범용 부동산 MCP 서버. 30+ 도구, 10 리소스, 11 프롬프트. 매물 관리, 시장분석, 지역 인텔리전스, 고객 매칭 | **P1** |
| **batchdata-mcp** | [zellerhaus/batchdata-mcp-real-estate](https://github.com/zellerhaus/batchdata-mcp-real-estate) | 주소 검증, 지오코딩, 부동산 검색 API. 매물 위치 기반 분석용 | **P2** |

### 2.2 보조 (Tier 2) — 재무/경제 데이터

| 이름 | 출처 | 설명 | 우선순위 |
|------|------|------|----------|
| **mcp-alphavantage** | [Alpha Vantage MCP](https://mcp.alphavantage.co/) | 주식, 외환, 원자재, 경제지표(GDP/금리/실업률/국채수익률), 60+ 기술적 지표. 부동산 REITs 분석 및 거시경제 연동 | **P0** |
| **mcp-currency-conversion** | henkisdabro/wookstar 번들 | 환율 변환. 해외 부동산 투자 비교 시 활용 | **P2** |
| **mcp-coingecko** | henkisdabro/wookstar 번들 | 암호화폐 데이터. 대안 투자 수단 비교용 | **P3** |

### 2.3 보조 (Tier 3) — 데이터 수집 및 리서치

| 이름 | 출처 | 설명 | 우선순위 |
|------|------|------|----------|
| **firecrawl-mcp-server** | [firecrawl/firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server) | 웹 스크래핑/크롤링. 부동산 포털(네이버부동산, 직방, 호갱노노 등) 매물/시세 데이터 수집 | **P0** |
| **mcp-perplexity** | henkisdabro/wookstar 번들 | AI 검색. 부동산 정책 변화, 재개발 뉴스, 규제 동향 실시간 리서치 | **P1** |
| **mcp-fetch** | henkisdabro/wookstar 번들 | 웹페이지 콘텐츠 가져오기. 공공데이터포털 API 직접 호출용 | **P1** |

### 2.4 보조 (Tier 4) — 생산성 및 데이터 관리

| 이름 | 출처 | 설명 | 우선순위 |
|------|------|------|----------|
| **mcp-google-workspace** | henkisdabro/wookstar 번들 | Google Sheets/Drive 연동. 분석 결과 스프레드시트 저장, 팀 공유 | **P1** |
| **mcp-notion** | henkisdabro/wookstar 번들 | Notion DB 연동. 매물 트래킹 대시보드, 투자 포트폴리오 관리 | **P2** |
| **documents 번들** | henkisdabro/wookstar 번들 | Word/Excel/PDF 처리. 투자 보고서 생성 및 기존 문서 분석 | **P2** |

### 2.5 Claude Code 마켓플레이스 스킬 (이미 내장)

현재 시스템에 설치된 스킬 중 부동산 투자에 직접 활용 가능한 것들:

| 스킬 | 활용 방안 |
|------|-----------|
| `data:analyze` | 수집된 실거래가 데이터 분석 |
| `data:explore-data` | 부동산 데이터셋 프로파일링 및 품질 확인 |
| `data:create-viz` | 시세 추이 차트, 지역별 비교 시각화 |
| `data:build-dashboard` | 인터랙티브 부동산 분석 대시보드 생성 |
| `data:write-query` | 부동산 DB 쿼리 작성 최적화 |
| `data:validate` | 분석 결과 QA 및 방법론 검증 |
| `data:statistical-analysis` | 가격 추세, 이상치 탐지, 상관분석 |
| `finance:variance-analysis` | 예상 수익률 vs 실제 수익률 분석 |
| `finance:financial-statements` | 부동산 투자 수익 재무제표 |
| `sc:research` | 부동산 시장 심층 리서치 |
| `sc:analyze` | 코드/데이터 품질 분석 |

---

## 3. 한국 부동산 공공데이터 소스

MCP 서버와 연동할 핵심 데이터 소스:

| 데이터 소스 | URL | 제공 데이터 |
|------------|-----|------------|
| 국토교통부 실거래가 API | [data.go.kr](https://www.data.go.kr/data/15126469/openapi.do) | 아파트/연립/단독/오피스텔 매매/전월세 실거래가 |
| 국토교통부 실거래가공개시스템 | [rt.molit.go.kr](https://rt.molit.go.kr/) | 실거래가 공개 조회 |
| 부동산공시가격 알리미 | [realtyprice.kr](https://www.realtyprice.kr/) | 공시지가, 공동주택 공시가격 |
| 서울시 부동산 실거래가 | [data.seoul.go.kr](https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do) | 서울시 한정 실거래가 상세 |
| KB부동산 데이터허브 | [data.kbland.kr](https://data.kbland.kr/) | KB시세, 빅데이터 통계 분석 |
| 부동산통계정보시스템 R-ONE | [reb.or.kr/r-one](https://www.reb.or.kr/r-one/) | 부동산 시장 통계 |
| 부동산114 | [r114.com](https://www.r114.com/) | 부동산 빅데이터 |
| 한국은행 경제통계시스템 | ecos.bok.or.kr | 기준금리, GDP, 소비자물가지수 |

---

## 4. 구현 계획

### Phase 1: 기반 구축 (1주차)

**목표:** 핵심 MCP 서버 설치 및 기본 데이터 파이프라인 구축

```
budongsan_plugins/
├── .claude/
│   ├── settings.json          # MCP 서버 설정
│   └── commands/
│       ├── analyze-apt.md     # 아파트 분석 커맨드
│       ├── market-report.md   # 시장 리포트 커맨드
│       └── investment-eval.md # 투자 평가 커맨드
├── docs/
│   └── prd.md                 # 본 문서
├── mcp-servers/
│   ├── kr-realestate/         # 한국 부동산 MCP 서버
│   └── config/                # API 키, 환경변수 관리
├── data/
│   ├── cache/                 # 실거래가 캐시 데이터
│   └── processed/             # 가공된 분석 데이터
├── skills/
│   ├── apt-price-tracker.md   # 아파트 시세 추적 스킬
│   ├── roi-calculator.md      # 투자 수익률 계산 스킬
│   └── area-comparison.md     # 지역 비교 분석 스킬
└── reports/                   # 생성된 리포트 저장
```

**작업 항목:**

1. **mcp-kr-realestate 설치 및 설정**
   - 국토교통부 API 키 발급 (data.go.kr)
   - 한국은행 API 키 발급 (ecos.bok.or.kr)
   - MCP 서버 로컬 설치 및 Claude Code 연동
   - `.claude/settings.json`에 MCP 서버 등록

2. **Firecrawl MCP 서버 설치**
   - Firecrawl API 키 발급
   - 부동산 포털 크롤링 규칙 정의

3. **Alpha Vantage MCP 서버 설치**
   - API 키 발급 (무료 tier: 25 requests/day)
   - 경제지표 조회 파이프라인 구축

### Phase 2: 분석 워크플로우 구축 (2주차)

**목표:** 커스텀 스킬 및 분석 자동화 파이프라인 생성

**작업 항목:**

1. **커스텀 Claude Code 스킬 개발**

   - `apt-price-tracker`: 특정 단지/지역의 실거래가 추이 추적
     - 입력: 지역코드, 단지명, 기간
     - 출력: 시계열 데이터, 변동률, 차트

   - `roi-calculator`: 부동산 투자 수익률 계산기
     - 입력: 매매가, 전세가, 대출조건, 보유기간
     - 출력: 갭투자 수익률, 연간 수익률, 세후 수익

   - `area-comparison`: 지역 간 비교 분석
     - 입력: 비교할 지역 리스트
     - 출력: 평균시세, 상승률, 인프라, 인구변화 비교표

2. **커스텀 Claude Code 커맨드 개발**

   - `/analyze-apt [지역] [단지명]` — 특정 아파트 종합 분석
   - `/market-report [지역]` — 지역 시장 동향 리포트 생성
   - `/investment-eval [매물정보]` — 투자 적정성 평가

3. **데이터 연동 파이프라인**
   - 실거래가 API -> 로컬 캐시 -> 분석 -> 리포트
   - 경제지표 API -> 거시경제 데이터 -> 상관분석

### Phase 3: 고급 분석 및 대시보드 (3주차)

**목표:** 시각화, 자동화, 고급 분석 기능 추가

**작업 항목:**

1. **인터랙티브 대시보드 생성**
   - `data:build-dashboard` 스킬 활용
   - 지역별 시세 히트맵
   - 매매/전세 갭 추이 차트
   - 투자 수익률 시뮬레이터

2. **자동화된 리포트 생성**
   - 주간/월간 시장 동향 리포트
   - 관심 단지 가격 변동 알림
   - PDF/Excel 형식 리포트 출력 (`documents` 번들 활용)

3. **고급 분석 기능**
   - 부동산-금리 상관분석 (Alpha Vantage 경제지표 연동)
   - 가격 이상치 탐지 (`data:statistical-analysis`)
   - 재개발/재건축 정보 크롤링 (Firecrawl)
   - 정책 변화 실시간 모니터링 (Perplexity MCP)

### Phase 4: 포트폴리오 관리 (4주차)

**목표:** 투자 포트폴리오 추적 및 관리 시스템

**작업 항목:**

1. **포트폴리오 트래커**
   - Notion 또는 Google Sheets 기반 포트폴리오 DB
   - 보유 자산 시가 자동 업데이트
   - 수익률 실시간 계산

2. **투자 의사결정 지원**
   - 매수/매도 타이밍 분석
   - 리스크 평가 매트릭스
   - 비교 투자 수단 분석 (주식 REITs vs 직접투자)

---

## 5. MCP 서버 설정 예시

```json
// .claude/settings.json
{
  "mcpServers": {
    "kr-realestate": {
      "command": "python",
      "args": ["mcp-servers/kr-realestate/main.py"],
      "env": {
        "MOLIT_API_KEY": "${MOLIT_API_KEY}",
        "BOK_API_KEY": "${BOK_API_KEY}"
      }
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      }
    },
    "alphavantage": {
      "command": "uvx",
      "args": ["av-mcp", "${ALPHAVANTAGE_API_KEY}"]
    },
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-perplexity"],
      "env": {
        "PERPLEXITY_API_KEY": "${PERPLEXITY_API_KEY}"
      }
    },
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-google-workspace"]
    }
  }
}
```

---

## 6. 필요한 API 키 및 사전 준비

| 서비스 | API 키 발급처 | 비용 | 비고 |
|--------|-------------|------|------|
| 국토교통부 실거래가 | [data.go.kr](https://data.go.kr) | 무료 | 공공데이터포털 회원가입 필요 |
| 한국은행 경제통계 | [ecos.bok.or.kr](https://ecos.bok.or.kr) | 무료 | 인증키 발급 |
| Firecrawl | [firecrawl.dev](https://firecrawl.dev) | Free tier 500 credits/월 | 웹 스크래핑용 |
| Alpha Vantage | [alphavantage.co](https://www.alphavantage.co/support/#api-key) | 무료 (25 req/day) | Premium 플랜 권장 |
| Perplexity | [perplexity.ai](https://perplexity.ai) | 유료 (Pro 필요) | 선택사항 |
| Google Cloud (Workspace) | [console.cloud.google.com](https://console.cloud.google.com) | 무료 tier | OAuth 설정 필요 |

---

## 7. 예상 워크플로우 시나리오

### 시나리오 A: 특정 아파트 투자 분석

```
사용자: "강남구 대치동 은마아파트 투자 분석해줘"

워크플로우:
1. [kr-realestate MCP] 실거래가 3년치 조회
2. [kr-realestate MCP] 공시가격 조회
3. [alphavantage MCP] 현재 기준금리, 국채수익률 조회
4. [firecrawl MCP] 네이버부동산에서 현재 매물/호가 수집
5. [perplexity MCP] 대치동 재건축 관련 최신 뉴스 검색
6. [data:statistical-analysis] 가격 추세 분석 및 예측
7. [data:create-viz] 시세 추이 차트 생성
8. [finance:variance-analysis] 투자 수익률 시뮬레이션
9. 종합 리포트 생성 및 투자 의견 제시
```

### 시나리오 B: 지역 비교 분석

```
사용자: "마포구 vs 성동구 vs 동작구 아파트 투자 비교해줘"

워크플로우:
1. [kr-realestate MCP] 3개 구 실거래가 데이터 수집
2. [firecrawl MCP] 각 지역 인프라/개발계획 정보 수집
3. [data:explore-data] 데이터 프로파일링
4. [data:statistical-analysis] 상승률, 변동성, 갭 비교
5. [data:build-dashboard] 비교 대시보드 생성
6. 지역별 장단점 요약 리포트
```

### 시나리오 C: 주간 시장 동향 리포트

```
사용자: "/market-report 서울"

워크플로우:
1. [kr-realestate MCP] 최근 1주간 거래 데이터 수집
2. [alphavantage MCP] 금리/경제지표 변동 확인
3. [perplexity MCP] 부동산 정책 뉴스 검색
4. [firecrawl MCP] 주요 포털 시장 동향 기사 수집
5. [data:analyze] 종합 분석
6. [data:create-viz] 주요 차트 생성
7. 주간 리포트 PDF 생성
```

---

## 8. 리스크 및 고려사항

### 기술적 리스크

| 리스크 | 영향 | 대응 방안 |
|--------|------|-----------|
| 공공데이터 API 불안정 | 데이터 수집 실패 | 로컬 캐시 + 재시도 로직 |
| Firecrawl 크롤링 차단 | 웹 데이터 수집 불가 | robots.txt 준수, 요청 간격 조절 |
| API 무료 tier 한도 초과 | 분석 지연 | 캐시 적극 활용, 배치 처리 |
| MCP 서버 호환성 이슈 | 기능 동작 불가 | 버전 관리, 대안 서버 확보 |

### 법적/윤리적 고려사항

- 공공데이터는 이용 약관 준수 (출처 명시, 상업적 이용 시 확인)
- 부동산 포털 크롤링 시 robots.txt 및 이용약관 확인
- 투자 조언이 아닌 데이터 분석 결과임을 명시
- 개인정보 관련 데이터 처리 주의

---

## 9. 성공 지표

| 지표 | 목표 |
|------|------|
| 실거래가 데이터 조회 응답 시간 | < 5초 (캐시 hit), < 15초 (API) |
| 종합 분석 리포트 생성 시간 | < 2분 |
| 데이터 캐시 적중률 | > 70% |
| 지원 지역 수 | 전국 시군구 |
| 분석 정확도 (실거래가 기준) | > 95% |

---

## 10. 참고 자료

- [Claude Code Plugin Marketplace](https://claudemarketplaces.com/)
- [mcp-kr-realestate (한국 부동산 MCP)](https://github.com/ChangooLee/mcp-kr-realestate)
- [real-estate-mcp (범용)](https://github.com/agentic-ops/real-estate-mcp)
- [batchdata-mcp-real-estate](https://github.com/zellerhaus/batchdata-mcp-real-estate)
- [Alpha Vantage MCP](https://mcp.alphavantage.co/)
- [Firecrawl MCP Server](https://github.com/firecrawl/firecrawl-mcp-server)
- [wookstar Claude Code Plugins](https://github.com/henkisdabro/wookstar-claude-code-plugins)
- [국토교통부 실거래가 API](https://www.data.go.kr/data/15126469/openapi.do)
- [한국은행 경제통계시스템](https://ecos.bok.or.kr/)
- [KB부동산 데이터허브](https://data.kbland.kr/)
