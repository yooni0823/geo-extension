GEO(AEO) Browser Extension (Planning)

목표
- 웹 페이지를 GEO/AEO 관점에서 진단하고, 필요 시 JSON-LD 초안(draft)을 생성해 “수정/반영”까지 이어지게 하는 브라우저 익스텐션을 만든다.
- 체크(진단): 스키마/메타/구조/답변 친화성
- 생성(보조): JSON-LD 없는 페이지에 대해 안전한 범위에서 초안 생성
- 공유(협업): 결과를 리포트로 내보내기(복사/다운로드)
-----------
구현 방식 후보
1) DevTools 패널형 (추천)
   - DevTools에 전용 패널을 추가해, 한 화면에서 진단/생성/리포트를 처리한다.

- 장점
  - 렌더링 이후 DOM 분석에 강함(SPA 포함)
  - 체크리스트/리포트 UI 구성 용이
  - 추후 네트워크/헤더 기반 진단 확장 가능

- 구성
  - devtools_page: 패널 UI
  - content_script: DOM/메타/JSON-LD 수집
  - service_worker: 메시지 중계, 저장, 내보내기

2) 페이지 오버레이형
   - 문제 요소(H1, alt, 링크 텍스트 등)를 페이지 위에서 하이라이트.

   - 장점: “여기 수정” 전달 쉬움
   - 주의: 페이지 CSS 충돌 가능(스타일 격리 필요)

3) 팝업형(툴바)
   - 간단 요약 위주. 구현은 빠르지만 깊은 분석은 한계.
----------
JSON-LD 생성 기능(없는 페이지 대상)
  - 가능 여부 : 
    가능. 다만 “완성본 자동 생성”이 아니라,
    초안(draft) 생성 + 누락/불확실 필드 경고 + 검증 + 내보내기 형태가 안전하고 실무적.

  - 생성 방식 3가지
    1) 규칙 기반(추천: MVP)
       - 페이지에서 추출 가능한 정보로 안전한 기본 스키마를 생성한다.
    
       1) 입력(추출)
          - title, meta description, canonical
          - og:*, twitter:*
          - H1/H2, 대표 단락(요약용)
          - 날짜/작성자(있는 경우)
          - html[lang]
          - Breadcrumb DOM(있는 경우)

       2) 출력(기본 세트)
          - WebPage + BreadcrumbList + Organization(+WebSite 옵션)
          - 콘텐츠 유형이 명확하면 Article/NewsArticle/BlogPosting을 “추천”

    2) 템플릿 + 사용자 입력(회사 프로필) 혼합 (실무형 베스트)

       - 확장 설정에 “회사/사이트 프로필”을 저장하고(Organization, 로고, sameAs 등),
       - 페이지별 추출값과 결합해 JSON-LD를 생성한다.
         - Organization: 고정값
         - WebPage/Article: 페이지별 자동
         - Breadcrumb: 있으면 자동 / 없으면 경고

    3) LLM(옵션)
       - 요약/추천 타입 선택 등은 유용하지만, 회사명/발행일/저자 등 팩트 필드는 추측 금지.

    * 자동 삽입에 대한 원칙
      - 확장 프로그램은 보통 서버에 저장 반영은 못하므로,
      - “복사/다운로드/CMS 붙여넣기”가 기본
      - 옵션으로 “이 페이지에서만 임시 주입(미리보기)” 제공 가능

  - 패널 UI 구성(추천)

    - Detected: 페이지에서 추출된 값(Title/Canonical/OG/Date/Author)
    - Schema 추천: WebPage/Article/FAQPage 등 후보 + 이유
    - Generated JSON-LD: 코드 + 복사 버튼
    - Validation: 필수 키 누락/URL 불일치/파싱 오류
    - (옵션) Diff: 기존 JSON-LD가 있으면 기존 vs 권장 변경점

- 기술 스택 제안
  - Chrome Extension Manifest V3
  - TypeScript
  - UI: React(DevTools 패널)
  - 번들: Vite(멀티 엔트리)
  - 검증: 1차(자체 규칙) + (선택) 외부 검증은 옵션 처리