import mermaid from 'mermaid';
const nodes = [...document.querySelectorAll('.mermaid')];
nodes.forEach(node => { node.dataset.source = node.textContent; });
let pending = Promise.resolve();
window.bindmodelDiagrams = theme => {
  pending = pending.then(async () => {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: theme === 'dark' ? 'dark' : 'neutral', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', suppressErrorRendering: true });
    for (const node of nodes) {
      node.removeAttribute('data-processed');
      node.textContent = node.dataset.source;
      try { await mermaid.run({ nodes: [node] }); }
      catch { node.textContent = node.dataset.source; node.setAttribute('aria-label', '구조도 소스'); }
    }
  }).catch(() => {});
  return pending;
};
window.bindmodelDiagrams(document.documentElement.dataset.theme);
