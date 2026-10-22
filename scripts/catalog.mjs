export const groups = [
  { id: 'start', title: '시작하기', number: '01', icon: 'spark' },
  { id: 'features', title: '기능 가이드', number: '02', icon: 'layers' },
  { id: 'advanced', title: '고급 기능', number: '03', icon: 'sliders' },
  { id: 'examples', title: '예제', number: '04', icon: 'code' },
  { id: 'api', title: 'API 레퍼런스', number: '05', icon: 'braces' }
];

export const pages = [
  ['guide/introduction', 'start', '소개', '1.시작하기/1.  소개.md', '비즈니스 로직과 화면을 분리하는 BindModel의 설계와 특징을 알아봅니다.'],
  ['guide/quick-start', 'start', '빠른 시작', '1.시작하기/2. 빠른 시작.md', '설치부터 첫 데이터 바인딩까지, 작은 예제로 시작해 보세요.'],
  ['guide/core-concepts', 'start', '핵심 개념', '1.시작하기/3. 핵심 개념.md', '모델, 명령, 테이블과 뷰. BindModel을 구성하는 기본 개념을 살펴봅니다.'],
  ['guide/features/model', 'features', '모델 구성', '2.기능 설명/1. 모델 구성.md', '모델을 생성하고 명령, 컬럼, 서버 연결을 구성합니다.'],
  ['guide/features/command', 'features', '명령 구성', '2.기능 설명/2. 명령 구성.md', '유효성 검사부터 서버 요청과 출력까지, 명령으로 흐름을 구성합니다.'],
  ['guide/features/columns', 'features', '컬럼 관리', '2.기능 설명/3. 컬럼 관리.md', '컬럼을 만들고 화면 요소와 명령에 연결하는 방법을 알아봅니다.'],
  ['guide/features/shared-column-properties', 'features', '공통 컬럼 속성', '2.기능 설명/4. 공통 컬럼 속성.md', '아이템으로 여러 컬럼의 공통 설정을 관리합니다.'],
  ['guide/features/flow-control', 'features', '흐름 제어', '2.기능 설명/5. 흐름 제어.md', '콜백 라이프사이클과 오류 처리로 실행 흐름을 제어합니다.'],
  ['guide/features/service-injection', 'features', '서비스 객체 주입', '2.기능 설명/6. 서비스 객체 주입.md', '설정과 비즈니스 로직을 서비스 객체로 모아 재사용합니다.'],
  ['guide/features/json-schema', 'features', 'JSON 스키마 가이드', '2.기능 설명/7. JSON 스키마 가이드.md', 'AUTO, DATA, ENTITY 모드로 서버 응답의 구조를 다룹니다.'],
  ['advanced/column-value-flow', 'advanced', '컬럼값 호출 구조', '3.고급 기능/1. 컬럼값 호출 구조.md', '값을 읽고 쓸 때 getter, setter, selector가 작동하는 구조를 살펴봅니다.'],
  ['advanced/tables', 'advanced', '테이블 관리', '3.고급 기능/2. 테이블 관리.md', '복수의 테이블로 데이터를 나누고 기본 테이블을 설정합니다.'],
  ['advanced/multiple-outputs', 'advanced', '명령 복수 출력 구성', '3.고급 기능/3. 명령 복수 출력 구성.md', '하나의 명령에서 여러 출력 뷰를 구성하고 응답을 처리합니다.'],
  ['advanced/execution', 'advanced', '실행 및 동기화', '3.고급 기능/4. 실행 및 동기화.md', 'Promise와 async/await로 명령을 순차 또는 병렬 실행합니다.'],
  ['advanced/events', 'advanced', '이벤트 설정', '3.고급 기능/5. 이벤트 설정.md', '명령 실행, 데이터 변경, 컬렉션 변경 이벤트에 반응합니다.'],
  ['advanced/composition', 'advanced', '객체 구성 방법', '3.고급 기능/6. 객체 구성 방법.md', '서비스 객체, 모델, 명령을 활용한 구성 방법을 비교합니다.'],
  ['examples/crudl', 'examples', 'CRUD + List 구현하기', '9.ETC/15분만에 CRUD+List 구현하기.md', '목록 조회, 등록, 수정, 삭제를 연결하며 하나의 화면을 완성합니다.'],
  ['api/bind-model', 'api', 'BindModel', '4.주요 클래스/1. BindModel 클래스.md', '모델의 속성, 메서드, 이벤트를 찾아보세요.'],
  ['api/bind-command', 'api', 'BindCommand', '4.주요 클래스/2. BindCommnad 클래스.md', '명령의 실행, 출력 옵션, 콜백과 뷰를 살펴봅니다.'],
  ['api/meta-view', 'api', 'MetaView', '4.주요 클래스/3. MetaView 클래스.md', '참조 컬럼으로 데이터를 구성하고 입출력을 관리합니다.'],
  ['api/html-column', 'api', 'HTMLColumn', '4.주요 클래스/4. HTMLColumn 클래스.md', '값, 유효성 검사, DOM 연결에 사용하는 컬럼 API입니다.'],
  ['api/property-collection', 'api', 'PropertyCollection', '4.주요 클래스/5. ProperyCollection 클래스.md', '키와 인덱스로 접근하는 컬렉션의 속성과 메서드를 확인합니다.'],
  ['api/meta-object', 'api', 'MetaObject', '4.주요 클래스/6. MetaObject 클래스.md', '객체 식별, 타입 확인, 직렬화를 위한 기본 API입니다.']
].map(([path, group, title, source, description]) => ({ path, group, title, source, description }));
