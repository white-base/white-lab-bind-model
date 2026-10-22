(() => {
  'use strict';
  const root = document.documentElement.dataset.root || './';
  const $ = (s, parent = document) => parent.querySelector(s);
  const $$ = (s, parent = document) => [...parent.querySelectorAll(s)];
  const toast = $('.toast');
  let toastTimer;
  const notify = message => {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2300);
  };
  async function copy(text, button) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const input = document.createElement('textarea');
        input.value = text;
        input.style.cssText = 'position:fixed;top:0;left:-9999px';
        document.body.append(input);
        input.select();
        const copied = document.execCommand('copy');
        input.remove();
        if (!copied) throw new Error('copy');
      }
      const previous = button.getAttribute('aria-label');
      button.setAttribute('aria-label', '복사 완료');
      notify('클립보드에 복사했습니다.');
      setTimeout(() => button.setAttribute('aria-label', previous || '코드 복사'), 2000);
    } catch { notify('복사하지 못했습니다. 코드를 선택해 복사해 주세요.'); }
  }
  $$('[data-copy]').forEach(button => button.addEventListener('click', () => copy(button.dataset.copy, button)));
  $$('.copy-code').forEach(button => button.addEventListener('click', () => copy($('pre code', button.closest('.code-block')).textContent, button)));

  const themeButton = $('.theme-toggle');
  function updateThemeLabel() {
    themeButton.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? '밝은 테마로 전환' : '어두운 테마로 전환');
  }
  updateThemeLabel();
  themeButton.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('bindmodel-theme', theme); } catch {}
    updateThemeLabel();
    if (window.bindmodelDiagrams) window.bindmodelDiagrams(theme);
  });
  $('.menu-toggle').addEventListener('click', event => {
    const open = document.body.classList.toggle('nav-open');
    const button = event.currentTarget;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? '주 메뉴 닫기' : '주 메뉴 열기');
  });
  function closeSidebar() {
    document.body.classList.remove('sidebar-open');
    $('.sidebar-toggle')?.setAttribute('aria-expanded', 'false');
    const backdrop = $('.sidebar-backdrop');
    if (backdrop) backdrop.hidden = true;
  }
  $('.sidebar-toggle')?.addEventListener('click', () => {
    const open = document.body.classList.toggle('sidebar-open');
    $('.sidebar-toggle').setAttribute('aria-expanded', String(open));
    $('.sidebar-backdrop').hidden = !open;
  });
  $('.sidebar-backdrop')?.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeSidebar();
      document.body.classList.remove('nav-open');
      $('.menu-toggle').setAttribute('aria-expanded', 'false');
      $('.menu-toggle').setAttribute('aria-label', '주 메뉴 열기');
    }
  });
  const tabs = $$('.editor-tab');
  let demoPromise;
  function initDemo() {
    if (demoPromise) return demoPromise;
    demoPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = root + 'assets/vendor/bind-model-1.1.13.js';
      script.onload = () => {
        try {
          const bm = new window._L.BindModel();
          bm.addSelector('u_name', '#u_name');
          bm.columns.u_name.value = 'Hello, BindModel';
          const sync = () => { $('#demo-output').textContent = String(bm.columns.u_name.value); };
          $('#u_name').addEventListener('input', sync);
          sync();
          $('#demo-status').textContent = 'BindModel 1.1.13 · 실제 모델의 값을 표시합니다.';
          resolve();
        } catch (error) { console.error('BindModel example:', error); reject(error); }
      };
      script.onerror = reject;
      document.head.append(script);
    }).catch(() => { $('#demo-status').textContent = '예제를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.'; });
    return demoPromise;
  }
  function activateTab(tab) {
    tabs.forEach(t => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !active;
    });
    if (tab.id === 'tab-result') initDemo();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      activateTab(tabs[next]);
      tabs[next].focus();
    });
  });

  const dialog = $('#search-dialog');
  const input = $('#search-input');
  const results = $('#search-results');
  const status = $('#search-status');
  let searchPromise, selected = -1, returnFocus;
  function loadSearch() {
    if (window.BINDMODEL_SEARCH) return Promise.resolve(window.BINDMODEL_SEARCH);
    if (!searchPromise) searchPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = root + 'assets/search-index.js';
      script.onload = () => resolve(window.BINDMODEL_SEARCH || []);
      script.onerror = () => { searchPromise = null; script.remove(); reject(new Error('load')); };
      document.head.append(script);
    });
    return searchPromise;
  }
  const escapeHTML = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function snippet(text, terms) {
    const first = Math.max(0, text.toLocaleLowerCase().indexOf(terms[0]) - 35);
    return (first ? '… ' : '') + text.slice(first, first + 145) + (text.length > first + 145 ? ' …' : '');
  }
  function highlight(text, terms) {
    const safe = escapeHTML(text);
    const termsPattern = terms.map(term => escapeHTML(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return safe.replace(new RegExp(termsPattern, 'gi'), match => `<mark>${match}</mark>`);
  }
  async function search() {
    const query = input.value.trim().toLocaleLowerCase();
    selected = -1;
    if (!query) { results.replaceChildren(); status.textContent = '검색어를 입력해 보세요. 예: 컬럼, execute, 서비스 객체'; return; }
    status.textContent = '문서를 검색하고 있습니다…';
    try {
      const entries = await loadSearch();
      if (input.value.trim().toLocaleLowerCase() !== query) return;
      const terms = query.split(/\s+/);
      const ranked = entries.map(entry => {
        const title = entry.title.toLocaleLowerCase();
        const section = entry.section.toLocaleLowerCase();
        const all = (entry.title + ' ' + entry.section + ' ' + entry.text).toLocaleLowerCase();
        if (!terms.every(term => all.includes(term))) return null;
        return { ...entry, score: terms.reduce((score, term) => score + (title.includes(term) ? 15 : 0) + (section.includes(term) ? 9 : 0), 0) + (section === query ? 20 : 0) };
      }).filter(Boolean).sort((a, b) => b.score - a.score);
      const seen = new Set();
      const matches = ranked.filter(entry => { const id = entry.url; if (seen.has(id)) return false; seen.add(id); return true; }).slice(0, 18);
      status.textContent = matches.length ? `${ranked.length}개의 검색 결과${ranked.length > 18 ? ' · 상위 18개 표시' : ''}` : '검색 결과가 없습니다. 다른 단어나 API 이름으로 검색해 보세요.';
      results.innerHTML = matches.map(entry => `<a class="search-result" href="${root}${escapeHTML(entry.url)}"><span>${escapeHTML(entry.group)} · ${escapeHTML(entry.title)}</span><strong>${highlight(entry.section || entry.title, terms)}</strong><p>${highlight(snippet(entry.text, terms), terms)}</p></a>`).join('');
    } catch { status.textContent = '검색 자료를 불러오지 못했습니다. 잠시 후 다시 검색해 주세요.'; results.replaceChildren(); }
  }
  function openSearch() {
    if (dialog.open) return;
    returnFocus = document.activeElement;
    dialog.showModal();
    input.focus();
    search();
    loadSearch().catch(() => {});
  }
  $$('[data-search]').forEach(button => button.addEventListener('click', openSearch));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => returnFocus?.focus());
  let searchTimer;
  input.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(search, 90); });
  dialog.addEventListener('keydown', event => {
    const links = $$('.search-result', results);
    if (['ArrowDown','ArrowUp'].includes(event.key) && links.length) {
      event.preventDefault();
      selected = selected < 0 ? (event.key === 'ArrowDown' ? 0 : links.length - 1) : (selected + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach((link, i) => link.classList.toggle('is-selected', i === selected));
      links[selected].scrollIntoView({ block: 'nearest' });
    }
    if (event.key === 'Enter' && document.activeElement === input && links.length) { event.preventDefault(); links[Math.max(0, selected)].click(); }
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
    if (event.key === '/' && !dialog.open && !/input|textarea|select/i.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { event.preventDefault(); openSearch(); }
  });

  const tocLinks = $$('.page-toc nav a');
  const headings = $$('.doc-content h2[id], .doc-content h3[id]');
  if (headings.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => tocLinks.forEach(link => {
        link.classList.toggle('is-active', decodeURIComponent(link.hash.slice(1)) === entry.target.id);
      }));
    }, { rootMargin: '-115px 0px -65% 0px' });
    headings.forEach(heading => observer.observe(heading));
  }
  const progress = $('.reading-progress');
  if (progress) {
    const updateProgress = () => { const max = document.documentElement.scrollHeight - innerHeight; progress.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + '%'; };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
  }
  if ($('.mermaid')) {
    const script = document.createElement('script');
    script.src = root + 'assets/diagrams.js';
    script.defer = true;
    document.head.append(script);
  }
})();
