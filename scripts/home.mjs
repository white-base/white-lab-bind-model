import { shell, icon, escape } from './layout.mjs';

export function homePage() {
  const line = (n, code) => `<span class="line-number" aria-hidden="true">${String(n).padStart(2, '0')}</span>${code}`;
  const code = [
    line(1, '<span class="syntax-keyword">import</span> { BindModel } <span class="syntax-keyword">from</span> <span class="syntax-string">\'logic-bind-model\'</span>;'),
    line(2, ''),
    line(3, '<span class="syntax-comment">// 화면과 비즈니스 로직을 연결하세요.</span>'),
    line(4, '<span class="syntax-keyword">const</span> bm = <span class="syntax-keyword">new</span> <span class="syntax-function">BindModel</span>();'),
    line(5, ''),
    line(6, 'bm.<span class="syntax-function">addSelector</span>(<span class="syntax-string">\'u_name\'</span>, <span class="syntax-string">\'#u_name\'</span>);'),
    line(7, 'bm.columns.u_name.value = <span class="syntax-string">\'Hello, BindModel\'</span>;'),
    line(8, ''),
    line(9, '<span class="syntax-comment">// 하나의 로직, 다양한 화면.</span>')
  ].join('\n');
  const cards = [
    ['spark', '01', '시작하기', '처음 만나는 BindModel.<br>설치부터 핵심 개념까지 함께 살펴보세요.', '3개의 문서', 'guide/quick-start.html'],
    ['layers', '02', '기능 가이드', '모델, 명령, 컬럼을 연결하고<br>비즈니스 로직을 구성해 보세요.', '7개의 문서', 'guide/features/model.html'],
    ['sliders', '03', '고급 기능', '복수 테이블부터 비동기 제어까지.<br>더 복잡한 요구사항을 다루는 방법.', '6개의 문서', 'advanced/column-value-flow.html'],
    ['braces', '05', 'API 레퍼런스', '필요한 클래스와 메서드를<br>정확하고 빠르게 찾아보세요.', '6개의 클래스', 'api/bind-model.html']
  ];
  const cardHTML = card => `<a class="doc-card" href="${card[5]}"><div class="card-top">${icon(card[0])}<span>${card[1]} / GUIDE</span></div><h3>${card[2]}</h3><p>${card[3]}</p><div class="card-bottom"><span>${card[4]}</span>${icon('arrow')}</div></a>`;
  return shell({ title: 'BindModel', description: '화면과 비즈니스 로직을 연결하는 JavaScript 프레임워크. BindModel의 시작하기, 기능 가이드, 예제와 API 문서를 만나보세요.', content: `
  <main id="main">
  <div class="container"><section class="hero" aria-labelledby="hero-title"><div class="hero-copy">
    <div class="eyebrow"><span class="live-dot"></span> BUSINESS LOGIC, BEAUTIFULLY CONNECTED</div>
    <h1 id="hero-title">화면은 바뀌어도,<br><em>로직은 그대로.</em></h1>
    <p>화면과 비즈니스 로직을 분리하는 더 단순한 방법.<br>명령과 데이터로 연결하고, 익숙한 JavaScript로 만드세요.</p>
    <div class="hero-actions"><a class="button primary" href="guide/quick-start.html">빠른 시작 ${icon('arrow')}</a><a class="button" href="guide/core-concepts.html">핵심 개념 살펴보기</a></div>
    <div class="hero-note">JavaScript<span></span>TypeScript<span></span>Browser &amp; Node.js</div>
  </div><div class="hero-visual"><div class="visual-grid" aria-hidden="true"></div><div class="editor">
    <div class="editor-top"><span class="window-dot"></span><span class="window-dot"></span><span class="window-dot"></span><span class="editor-filename">hello-bindmodel.js</span><span class="editor-label">GETTING STARTED</span></div>
    <div class="editor-tabs" role="tablist" aria-label="바인딩 예제"><button class="editor-tab" id="tab-js" role="tab" aria-selected="true" aria-controls="panel-js">JavaScript</button><button class="editor-tab" id="tab-html" role="tab" aria-selected="false" tabindex="-1" aria-controls="panel-html">HTML</button><button class="editor-tab" id="tab-result" role="tab" aria-selected="false" tabindex="-1" aria-controls="panel-result">결과 보기 ↗</button></div>
    <div class="editor-code" id="panel-js" role="tabpanel" aria-labelledby="tab-js"><pre><code>${code}</code></pre></div>
    <div class="editor-code" id="panel-html" role="tabpanel" aria-labelledby="tab-html" hidden><pre><code>${line(1, '<span class="syntax-comment">&lt;!-- HTML 요소를 selector로 연결합니다. --&gt;</span>')}\n${line(2, '&lt;<span class="syntax-keyword">label</span> <span class="syntax-function">for</span>=<span class="syntax-string">"u_name"</span>&gt;이름&lt;/<span class="syntax-keyword">label</span>&gt;')}\n${line(3, '&lt;<span class="syntax-keyword">input</span> <span class="syntax-function">id</span>=<span class="syntax-string">"u_name"</span> <span class="syntax-function">type</span>=<span class="syntax-string">"text"</span> /&gt;')}\n\n${line(5, '<span class="syntax-comment">&lt;!-- 화면이 바뀌어도 로직은 독립적으로. --&gt;</span>')}</code></pre></div>
    <div class="hero-result" id="panel-result" role="tabpanel" aria-labelledby="tab-result" hidden><label class="mini-label" for="u_name">이름을 바꿔 보세요.</label><input class="mini-input" id="u_name" value="Hello, BindModel" maxlength="80" autocomplete="off"><p class="mini-label">bm.columns.u_name.value</p><div class="mini-output" id="demo-output" aria-live="polite">Hello, BindModel</div><p class="mini-label" id="demo-status">입력 요소와 모델을 연결합니다.</p></div>
    <div class="editor-status"><span><i class="status-dot"></i> Vanilla JavaScript</span><span>UTF-8 &nbsp; JavaScript</span></div>
  </div><div class="result-note"><div class="result-check">${icon('check')}</div><div><strong>작은 연결로 시작하세요.</strong><span>복잡한 설정 없이, 익숙한 코드로.</span></div></div></div></section>
  <div class="install-strip"><p>지금 시작해 보세요</p><div class="install-command"><span class="prompt">$</span><code>npm install logic-bind-model</code><button class="icon-button" data-copy="npm install logic-bind-model" aria-label="설치 명령 복사">${icon('copy')}</button></div><div class="strip-links"><a href="guide/quick-start.html#설치하기">설치 가이드 ${icon('arrow')}</a><a href="https://www.npmjs.com/package/logic-bind-model">npm ${icon('external')}</a></div></div>
  <section class="principles" aria-label="BindModel의 특징"><div class="principle">${icon('layers')}<h2>로직은 독립적으로</h2><p>화면과 비즈니스 로직을 분리하세요.<br>같은 로직을 다양한 UI에서 재사용할 수 있습니다.</p><span class="tag">SEPARATION OF CONCERNS</span></div><div class="principle">${icon('terminal')}<h2>흐름은 명령으로</h2><p>검증, 요청, 응답을 하나의 명령으로.<br>일관된 패턴으로 데이터 흐름을 구성합니다.</p><span class="tag">COMMAND-BASED WORKFLOW</span></div><div class="principle">${icon('braces')}<h2>데이터는 구조적으로</h2><p>테이블과 뷰로 데이터를 관리하세요.<br>복잡한 데이터에도 명확한 구조를 더합니다.</p><span class="tag">STRUCTURED DATA, CLEAR INTENT</span></div></section></div>
  <section class="documentation-section" aria-labelledby="docs-title"><div class="container"><div class="section-heading"><div><div class="eyebrow">EXPLORE THE DOCUMENTATION<span class="eyebrow-rule"></span>23 DOCS</div><h2 id="docs-title">필요한 곳부터, 차근차근.</h2></div><p>첫 연결을 만드는 순간부터 깊이 있는 활용까지.<br>지금 필요한 문서를 만나보세요.</p></div><div class="docs-cards">${cards.slice(0,3).map(cardHTML).join('')}<a class="doc-card wide" href="examples/crudl.html"><div><div class="card-top">${icon('code')}<span>04 / HANDS-ON</span></div><h3>직접 만들며 익히는 CRUD + List</h3><p>조회부터 등록, 수정, 삭제까지.<br>하나의 예제로 전체 흐름을 연결합니다.</p><div class="card-bottom"><span>예제 따라 하기</span>${icon('arrow')}</div></div><div class="wide-code" aria-hidden="true"><b>create</b>  → 새 데이터 등록\n<b>read</b>    → 목록과 상세 조회\n<b>update</b>  → 데이터 수정\n<b>delete</b>  → 데이터 삭제</div></a>${cardHTML(cards[3])}</div></div></section>
  <div class="container"><section class="architecture-section" aria-labelledby="architecture-title"><div class="section-heading"><div><div class="eyebrow">A SIMPLE MENTAL MODEL<span class="eyebrow-rule"></span></div><h2 id="architecture-title">데이터와 화면 사이, 명확한 역할.</h2></div><p>모델이 데이터를 모으고, 명령이 흐름을 만듭니다.<br>뷰는 필요한 컬럼을 참조해 연결합니다.</p></div><div class="architecture-board"><div class="architecture-node main-node"><span>01 / MODEL</span><strong>BindModel</strong><p>데이터와 명령을 함께 관리</p></div>${icon('arrow')}<div class="architecture-node"><span>02 / COMMAND</span><strong>BindCommand</strong><p>검증 · 서버 요청 · 응답 처리</p></div>${icon('arrow')}<div class="architecture-node"><span>03 / VIEW</span><strong>MetaView</strong><div class="view-pills"><span>valid</span><span>bind</span><span>output</span></div></div></div><div class="architecture-caption"><span>MetaTable의 컬럼을 MetaView에서 참조하여 사용합니다.</span><a href="guide/core-concepts.html">핵심 개념 자세히 보기 ↗</a></div></section>
  <section class="start-banner"><div><h2>첫 번째 연결을 만들어 볼까요?</h2><p>설치하고, 컬럼을 연결하고, 첫 결과를 확인하세요.</p></div><a class="button primary" href="guide/quick-start.html">BindModel 시작하기 ${icon('arrow')}</a></section></div>
  </main>` });
}
