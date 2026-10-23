import { groups, pages } from './catalog.mjs';
import { readFileSync } from 'node:fs';

export const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const paths = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M20 13A8 8 0 0 1 11 4a8 8 0 1 0 9 9Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  spark: '<path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7Z"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8Z"/><path d="m2 12 10 5 10-5M2 16l10 5 10-5"/>',
  sliders: '<path d="M4 7h7m6 0h3M4 17h3m6 0h7"/><circle cx="14" cy="7" r="3"/><circle cx="10" cy="17" r="3"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/>',
  braces: '<path d="M9 3H7a2 2 0 0 0-2 2v4l-2 3 2 3v4a2 2 0 0 0 2 2h2M15 3h2a2 2 0 0 1 2 2v4l2 3-2 3v4a2 2 0 0 1-2 2h-2"/>',
  book: '<path d="M12 5v16M12 5C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z"/>',
  github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-4a3.5 3.5 0 0 0-1-2.7c3.3-.4 6.7-1.6 6.7-7.3A5.6 5.6 0 0 0 20 4.1 5.2 5.2 0 0 0 19.9.3S18.6-.1 16 1.8a13.5 13.5 0 0 0-7 0C6.4-.1 5.1.3 5.1.3A5.2 5.2 0 0 0 5 4.1 5.6 5.6 0 0 0 3.3 8c0 5.7 3.4 6.9 6.7 7.3A3.5 3.5 0 0 0 9 18v4"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  link: '<path d="m10 13 4-4m-6 7-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 2 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(1 0)"/>',
  terminal: '<path d="m5 7 5 5-5 5m8 0h6"/>'
};
export const icon = (name, extra = '') => `<svg class="icon ${extra}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`;
// Inline the shared vector so theme colors and file:// previews work without a fetch.
export const brand = readFileSync(new URL('../docs/assets/logo.svg', import.meta.url), 'utf8')
  .replace(/<svg[^>]*>/, '<svg class="brand-logo" width="186" height="46" viewBox="0 0 744 182" aria-hidden="true">')
  .replace(/\s*<title>[^<]*<\/title>/, '')
  .trim();

function header(root, group) {
  return `<a class="skip-link" href="#main">본문 바로가기</a>
  <header class="site-header"><div class="header-inner">
    <a class="brand" href="${root}index.html" aria-label="BindModel 홈">${brand}</a>
    <nav class="main-nav" id="main-nav" aria-label="주 메뉴">
      ${groups.map(g => `<a href="${root}${pages.find(p => p.group === g.id).path}.html"${group === g.id ? ' class="is-active" aria-current="true"' : ''}>${g.title === 'API 레퍼런스' ? 'API' : g.title}</a>`).join('')}
    </nav>
    <div class="header-tools"><button class="search-trigger" data-search aria-label="문서 검색">${icon('search')}<span>문서 검색</span><kbd>⌘ K</kbd></button>
    <button class="icon-button theme-toggle" aria-label="어두운 테마로 전환" title="테마 전환">${icon('sun', 'theme-sun')}${icon('moon', 'theme-moon')}</button>
    <a class="icon-button github-link" href="https://github.com/white-base/bind-model" aria-label="BindModel GitHub 저장소">${icon('github')}</a>
    <button class="icon-button menu-toggle" aria-controls="main-nav" aria-expanded="false" aria-label="주 메뉴 열기">${icon('menu')}</button></div>
  </div></header>`;
}

export function sidebar(root, active) {
  return `<button class="sidebar-backdrop" aria-label="문서 메뉴 닫기" hidden></button><aside class="docs-sidebar" id="docs-sidebar" aria-label="문서 목록"><a class="sidebar-home" href="${root}index.html">${icon('book')}문서 둘러보기</a>${groups.map(g => `<section class="sidebar-group"><h2><span>${g.title}</span><span>${String(pages.filter(p => p.group === g.id).length).padStart(2, '0')}</span></h2><ul>${pages.filter(p => p.group === g.id).map(p => `<li><a href="${root}${p.path}.html"${p.path === active ? ' class="is-current" aria-current="page"' : ''}>${escape(p.title)}</a></li>`).join('')}</ul></section>`).join('')}<a class="sidebar-bottom" href="https://github.com/white-base/bind-model/issues">문서 개선 제안 ${icon('external')}</a></aside>`;
}

function searchDialog() {
  return `<dialog id="search-dialog" class="search-dialog" aria-labelledby="search-label"><div class="search-top">${icon('search')}<label class="sr-only" id="search-label" for="search-input">문서 검색</label><input id="search-input" type="search" placeholder="문서, 메서드, 개념 검색…" autocomplete="off" spellcheck="false" aria-controls="search-results"><button class="dialog-close" aria-label="검색 닫기">ESC</button></div><p id="search-status" class="search-status" role="status">검색어를 입력해 보세요.</p><div id="search-results" class="search-results"></div><div class="search-footer"><span><kbd>↑</kbd><kbd>↓</kbd> 이동 <kbd>↵</kbd> 열기</span><span>BindModel 문서 검색</span></div></dialog>`;
}

export function footer(root) {
  return `<footer class="site-footer"><div class="footer-inner"><a class="brand footer-brand" href="${root}index.html" aria-label="BindModel 홈">${brand}</a><p>화면과 로직 사이, 더 나은 연결.</p><div><a href="https://github.com/white-base/bind-model">GitHub ${icon('external')}</a><span>© ${new Date().getUTCFullYear()} White Lab</span></div></div></footer>`;
}

export function shell({ title, description, root = './', group = '', path = 'index.html', content, doc = false, head = '' }) {
  const url = `https://white-base.github.io/white-lab-bind-model/${path}`;
  return `<!doctype html>
<html lang="ko" data-root="${root}">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  ${head}
  <title>${escape(title)}${title === 'BindModel' ? ' — 화면과 로직 사이, 더 나은 연결' : ' | BindModel'}</title>
  <meta name="description" content="${escape(description)}"><meta name="theme-color" content="#f8f8f4">
  <meta property="og:type" content="website"><meta property="og:title" content="${escape(title)} | BindModel"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://white-base.github.io/white-lab-bind-model/assets/social.svg">
  <link rel="canonical" href="${url}"><link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
  <script>try{document.documentElement.dataset.theme=localStorage.getItem('bindmodel-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}</script>
  <link rel="stylesheet" href="${root}assets/site.css"><script src="${root}assets/site.js" defer></script>
</head>
<body class="${doc ? 'documentation' : 'home-page'}">${header(root, group)}${content}${doc ? '' : footer(root)}${searchDialog()}<div class="toast" role="status" aria-live="polite"></div></body>
</html>\n`;
}

export function documentPage(page, html, toc, wordCount) {
  const root = '../'.repeat(page.path.split('/').length - 1);
  const group = groups.find(g => g.id === page.group);
  const index = pages.findIndex(p => p.path === page.path);
  const adjacent = (p, direction) => p ? `<a class="page-link ${direction}" href="${root}${p.path}.html"><span>${direction === 'prev' ? '이전 문서' : '다음 문서'}</span><strong>${escape(p.title)}${direction === 'next' ? icon('arrow') : ''}</strong></a>` : '<span></span>';
  return shell({ title: page.title, description: page.description, root, group: page.group, path: page.path + '.html', doc: true, content: `
  <div class="reading-progress" aria-hidden="true"></div>
  <div class="mobile-docbar"><button class="sidebar-toggle" aria-controls="docs-sidebar" aria-expanded="false">${icon('menu')}문서 메뉴</button><a href="#page-toc">이 페이지의 내용 ${icon('chevron')}</a></div>
  <div class="docs-layout">${sidebar(root, page.path)}
  <main class="doc-main" id="main"><article data-search-content>
    <div class="doc-breadcrumb"><a href="${root}index.html">문서</a>${icon('chevron')}<span>${group.title}</span></div>
    <header class="doc-heading"><div class="eyebrow">${group.title}<span class="eyebrow-rule"></span>${group.number}</div><h1>${escape(page.title)}</h1><p>${escape(page.description)}</p><div class="doc-meta"><span>한국어 문서</span><span>약 ${Math.max(2, Math.ceil(wordCount / 650))}분</span></div></header>
    <div class="doc-content">${html}</div>
    <div class="doc-feedback"><span>더 나은 문서를 함께 만들어요.</span><a href="https://github.com/white-base/bind-model/issues">오류 제보 및 개선 제안 ${icon('external')}</a></div>
    <nav class="page-pagination" aria-label="이전·다음 문서">${adjacent(pages[index - 1], 'prev')}${adjacent(pages[index + 1], 'next')}</nav>
  </article><footer class="doc-footer">BindModel · White Lab<a href="${root}index.html">홈으로 ${icon('arrow')}</a></footer></main>
  <aside class="page-toc" id="page-toc" aria-label="이 페이지의 내용"><p>이 페이지의 내용</p><nav>${toc.filter(t => t.level <= 3).map(t => `<a class="toc-level-${t.level}" href="#${escape(t.id)}">${escape(t.title)}</a>`).join('')}</nav><a class="back-top" href="#main">맨 위로 ↑</a></aside>
  </div>` });
}
