# BindModel 웹사이트

`docs/` 안의 HTML·CSS·JavaScript를 그대로 제공하는 GitHub Pages 사이트입니다. 방문자에게 제공되는 사이트는 프레임워크나 빌드 서버가 필요하지 않습니다.

## 구성

- `docs/index.html`: 메인 화면과 실제 BindModel 입력 예제
- `docs/guide/`: 시작하기 3개와 기능 가이드 7개
- `docs/advanced/`: 고급 기능 6개
- `docs/examples/crudl.html`: CRUD + List 튜토리얼
- `docs/api/`: 클래스 레퍼런스 6개
- `docs/assets/site.css`, `site.js`: 공통 스타일과 검색·테마·탐색 동작
- `docs/assets/search-index.js`: 문서 23개의 검색 자료
- `plans/`: 계획서, 문서 이전 기록, 검수 결과

총 25개의 HTML 페이지(홈·문서 23개·404)와 원본 이미지 5개를 포함합니다. 사이트 자산과 라이브러리를 로컬에 포함하여 외부 CDN 없이 화면·검색·다이어그램·메인 예제를 사용할 수 있습니다. 문서 본문의 CDN 주소는 사용 방법을 설명하는 코드입니다.

## 미리보기

Python 3.10 이상으로 실행합니다. Node.js와 npm은 문서 제작 도구를 사용할 때 필요합니다.

```bash
python3 scripts/serve.py
# 또는 npm run dev
```

- 기본 주소: http://127.0.0.1:4183/
- Pages 하위 경로 검수: http://127.0.0.1:4183/white-lab-bind-model/
- 다른 포트: `python3 scripts/serve.py --port 4184`

`docs/index.html`을 파일로 직접 열어도 기본 탐색과 검색은 사용할 수 있습니다. 다이어그램과 라이브러리의 언어 파일을 포함한 검수는 HTTP 미리보기를 권장합니다.

## 문서 수정

1. 해당 `docs/**/*.html`의 `.doc-content` 영역을 편집합니다.
2. 제목을 바꾸면 본문 목차의 링크와 heading `id`도 함께 맞춥니다.
3. `python3 scripts/index_site.py`로 검색 자료와 사이트맵을 갱신합니다.
4. `python3 scripts/check_site.py`로 내부 링크·앵커·자산과 JavaScript 구문을 확인합니다. 이 검사는 Node.js 22를 사용합니다.

페이지를 추가하면 `plans/migration-manifest.json`에 `target`을 추가하고 공통 메뉴에도 연결합니다. `scripts/catalog.mjs`, `scripts/layout.mjs`는 원고를 처음 HTML로 이전할 때 사용한 목록과 공통 레이아웃입니다.

기존 ZIP을 다시 가져오는 제작 도구는 다음과 같습니다. 이 명령은 문서 HTML·홈·404를 다시 생성하여 HTML 직접 수정 내용을 덮어쓰므로, 원본 재이전이 필요할 때만 사용합니다.

```bash
npm ci
npm run import:docs -- '/압축을 해제한/10.문서'
npm run index
npm run check
npm run check:examples
```

`check:examples`는 문서의 JavaScript·TypeScript 코드 구문을 검사합니다. 모든 예제의 타입 검사나 실제 서버 동작을 보장하는 검사는 아닙니다. API 요청이 있는 예제는 해당 서버와 HTML 요소를 준비해야 합니다.

## GitHub Pages 배포

두 방식 중 하나를 선택합니다.

1. **브랜치 게시:** 저장소 Settings → Pages → Source를 `Deploy from a branch`, 브랜치를 `main`, 폴더를 `/docs`로 설정합니다. 이 경우 `.github/workflows/pages.yml`의 `deploy` job을 비활성화하거나 제거합니다.
2. **Actions 게시:** Settings → Pages → Source를 `GitHub Actions`로 설정합니다. 포함한 워크플로가 PR에서 링크를 검증하고, `main` push 또는 수동 실행에서 `docs/`를 게시합니다. npm 설치나 사이트 빌드 단계는 필요 없습니다.

GitHub Pages 기본 예상 주소는 `https://white-base.github.io/white-lab-bind-model/`입니다. 설정 변경, commit/push, 실제 공개 배포는 아직 수행하지 않았습니다.

사용자 지정 도메인으로 바꾸면 다음 명령으로 canonical·공유 URL·사이트맵을 갱신하고 GitHub Pages와 DNS를 설정합니다.

```bash
python3 scripts/index_site.py --base-url https://원하는도메인/
```

도메인은 이 구현에서 지정하지 않았습니다. 기존 `bindmodel.com`의 연결을 변경하지 않습니다. 링크와 자산은 상대 경로를 사용합니다. 404 페이지는 기본 프로젝트 Pages 경로와 도메인 루트에서 복구 링크를 제공합니다.

## 출처와 라이선스

콘텐츠 기준은 사용자가 제공한 `10.문서.zip`입니다. 기존 사이트는 구조만 참고했습니다. Obsidian 메모와 내부 개발 자료 3개는 공개 페이지에서 제외했습니다. 변경 사항은 [문서 이전 기록](plans/content-migration.md)을 확인하세요.

메인 예제는 npm 공개 배포본 `logic-bind-model@1.1.13`의 일반 브라우저 파일을 사용합니다. 문서 다이어그램은 Mermaid를 로컬 번들로 제공합니다. 포함한 라이브러리의 출처·라이선스는 [서드파티 안내](docs/assets/vendor/NOTICE.txt)에 기록했습니다.
