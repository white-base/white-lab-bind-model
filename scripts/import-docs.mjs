// One-time importer. Published pages are editable, self-contained HTML.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { build } from 'esbuild';
import { pages } from './catalog.mjs';
import { documentPage, shell, escape, icon } from './layout.mjs';
import { homePage } from './home.mjs';

const sourceRoot = process.argv[2];
if (!sourceRoot) throw new Error('사용법: npm run import:docs -- <압축을 해제한 10.문서 폴더>');
const output = path.resolve('docs');
const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
function repairExample(code, lang) {
  if (!['js', 'javascript', 'ts', 'typescript'].includes(lang)) return code;
  code = code.replace(/\bdecalre\b/g, 'declare').replace(/\breutrn\b/g, 'return').replace(/\bstirng\b/g, 'string').replace(/\bConstrainstType\b/g, 'ConstraintType');
  code = code.replace('return = {', 'return {').replace("'Content-Type': 'application/json';", "'Content-Type': 'application/json'");
  if (lang === 'ts' || lang === 'typescript') {
    code = code.replace(/(\??:\s*boolean)\s*=\s*true/g, '$1');
    code = code.replace(/readonly type (\w+) = ([^;]+);/g, 'declare const $1: $2;');
    code = code.replace(/^type default =/m, 'type DefaultValue =');
    code = code.replace(/^(type \w+ = \([^;]+?\)):\s*([^;\n]+);/gm, '$1 => $2;');
    code = code.replace(/^(type [^\n]+=>\s*(?:void|boolean)),\s*$/gm, '$1;');
    code = code.replace('type FullColumnType = TableNameType + \'.\' + ColumnType;', 'type FullColumnType = `${TableNameType}.${ColumnType}`;');
    code = code.replace('outputOption?: OutOptType | OptionType | SchemaType | IndexType;', 'outputOption?: OutOptType | OptionType | SchemaType | IndexType,');
    code = code.replace("views: 'ViewType | ViewType[]", 'views: ViewType | ViewType[]');
    code = code.replace(/(currentKey: string)\n(\s+array:)/, '$1,\n$2');
    code = code.replace("=> void',", '=> void,').replace("=> boolean',", '=> boolean,');
    code = code.replace('fn? = { [key: string]: Function }', 'fn?: { [key: string]: Function }');
  } else {
    if (/^const bm = new BindModel\(\{/.test(code.trim()) && /\n\};\s*$/.test(code)) code = code.replace(/\n\};\s*$/, '\n});\n');
    code = code.replace("dd: { selector: { key:'#ID', type: 'value' },", "dd: { selector: { key:'#ID', type: 'value' } },");
    code = code.replace('`aa`:', "'aa':");
    code = code.replace('export class CommonService() {', 'export class CommonService {').replace('cbFail: function(msg, valid)', 'cbFail = function(msg, valid)').replace('cbError: function(msg, status, response)', 'cbError = function(msg, status, response)');
    if (/^(?:read|'second\.cc'):\s*\{/.test(code.trim())) code = '({\n' + code.trim() + '\n});\n';
  }
  return code;
}
md.renderer.rules.fence = (tokens, index) => {
  const token = tokens[index];
  const lang = token.info.trim().split(/\s+/)[0];
  token.content = repairExample(token.content, lang);
  if (lang === 'mermaid') return `<figure class="diagram"><pre class="mermaid">${escape(token.content)}</pre><figcaption>구조와 흐름을 설명하는 다이어그램</figcaption></figure>\n`;
  const highlighted = lang && hljs.getLanguage(lang) ? hljs.highlight(token.content, { language: lang }).value : escape(token.content);
  return `<div class="code-block"><div class="code-toolbar"><span>${escape(lang || 'text')}</span><button class="copy-code" aria-label="코드 복사">${icon('copy')}<span>복사</span></button></div><pre><code${lang ? ` class="language-${escape(lang)}"` : ''}>${highlighted}</code></pre></div>\n`;
};
md.renderer.rules.table_open = () => '<div class="table-scroll" tabindex="0" role="region" aria-label="데이터 표"><table>\n';
md.renderer.rules.table_close = () => '</table></div>\n';

function clean(source, page) {
  let text = source.normalize('NFC').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').replace(/%%[\s\S]*?%%/g, '').trim();
  text = text.replace(/!\[\[([^\]]+)\]\]/g, (_, image) => `![${({ 'crudl.png':'CRUD 목록과 편집 폼 전체 화면', 'list.png':'목록 조회 화면', 'create.png':'새 데이터 등록 화면', 'update.png':'데이터 수정 화면', 'delete.png':'데이터 삭제 화면' })[image] || image}](../assets/images/examples/${image})`);
  text = text.replaceAll('BindCommnad', 'BindCommand').replaceAll('ProperyCollection', 'PropertyCollection').replaceAll('ouputOption', 'outputOption').replaceAll('vaild', 'valid').replaceAll('CDM 버전', 'CDN 버전');
  text = text.replaceAll('option: SchemaType, schema: SchemaType', 'option: OptionType, schema: SchemaType');
  text = text.replace(/\{\s*'output'\s*\}/g, "['output']");
  if (page.path === 'advanced/tables') text = text.replace("bm.addTable('second');\n\n// bm._baseTable === bm.second", "bm.addTable('second', true);\n\n// bm._baseTable === bm.second");
  if (page.path === 'advanced/column-value-flow') {
    text = text.replace(/^#삭제대상\s*$/m, '').replace('getFilter(seValue)', 'getFilter(selectorValue)');
    let diagram = 0;
    text = text.replace(/```mermaid[\s\S]*?```/g, block => ++diagram === 2 ? '' : block);
  }
  if (page.path === 'guide/quick-start') {
    text = text.replaceAll('https://unpkg.com/logic-bind-model/', 'https://unpkg.com/logic-bind-model@1.1.13/');
    text = text.replaceAll('bind-model.node.js', 'bind-model.node.cjs').replace('최신 버전(latest)', '문서 검증 버전(1.1.13)');
    text = text.replace(/#### 압축 버전[\s\S]*?(?=#### 버전 지정)/, '');
    text = text.replace("- 'cmd1' 는 `command` 의 명령 이름이며, 'output' 의 `MetaView` 이름입니다.", "- 'cmd1'은 명령 이름이고, 'output'은 해당 명령의 출력 뷰 이름입니다.");
    text = text.replace("- 뷰 종류 : *''valid', bind', 'output', 'misc'*", "- 뷰 종류: `valid`, `bind`, `output`, `misc`");
  }
  // The original introduction repeats an earlier draft inside a comment; clean() removed it.
  return text;
}

const changes = [];
for (const page of pages) {
  let source = await readFile(path.join(sourceRoot, page.source), 'utf8');
  const text = clean(source, page);
  const tokens = md.parse(text, {});
  const toc = [], ids = new Map();
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'heading_open') continue;
    const heading = tokens[i + 1];
    const title = heading.children.filter(t => t.type !== 'html_inline').map(t => t.content).join('');
    const base = title.toLocaleLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu, '').trim().replace(/\s+/g, '-') || 'section';
    const n = (ids.get(base) || 0) + 1;
    ids.set(base, n);
    const id = base + (n > 1 ? '-' + n : '');
    tokens[i].attrSet('id', id);
    const level = Number(tokens[i].tag.slice(1));
    toc.push({ level, title, id });
    heading.children.push({ type: 'html_inline', content: `<a class="heading-anchor" href="#${escape(id)}" aria-label="${escape(title)} 링크">#</a>` });
  }
  let html = md.renderer.render(tokens, md.options, {});
  if (page.path === 'guide/quick-start') html = `<aside class="notice"><strong>예제 기준: logic-bind-model 1.1.13</strong><p>Node.js에서는 npm 패키지를, 브라우저에서는 아래 CDN 파일을 사용하세요. 서버 요청 예제의 <code>/user</code>는 직접 준비한 API 주소로 바꿔 주세요.</p></aside>` + html;
  if (page.path === 'examples/crudl') html = `<aside class="notice"><strong>코드로 따라 하는 CRUD 예제</strong><p>이 문서는 화면과 서비스 객체를 구성하는 튜토리얼입니다. 등록·수정·삭제를 저장하려면 별도의 서버 API가 필요합니다.</p></aside>` + html;
  if (page.path === 'advanced/column-value-flow' || page.path === 'api/html-column') html = `<aside class="notice"><strong>1.1.13에서 필터를 사용할 때</strong><p>이 배포 버전에서는 <code>getFilter</code>로 값을 읽을 때 <code>selector</code> 설정이 필요합니다. DOM을 읽지 않는 필터에는 <code>selector: { key: '#example', type: 'none' }</code>을 함께 설정하세요. <code>key</code>는 실제 사용하는 요소에 맞춰 지정합니다.</p></aside>` + html;
  const file = path.join(output, page.path + '.html');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, documentPage(page, html, toc, text.length));
  changes.push({ source: page.source, target: 'docs/' + page.path + '.html', headings: toc.length });
}
await mkdir(path.join(output, 'assets/images/examples'), { recursive: true });
for (const image of ['crudl','list','create','update','delete']) await copyFile(path.join(sourceRoot, '9.ETC', image + '.png'), path.join(output, 'assets/images/examples', image + '.png'));
await writeFile(path.join(output, 'index.html'), homePage());
await writeFile(path.join(output, '404.html'), shell({ title:'페이지를 찾을 수 없습니다', description:'찾으시는 문서가 이동했거나 주소가 잘못되었습니다. BindModel 문서 검색을 이용해 주세요.', path:'404.html', head:`<meta name="robots" content="noindex"><script>if(location.protocol!=='file:'){var b=document.createElement('base');b.href=location.hostname.endsWith('github.io')||location.pathname.startsWith('/white-lab-bind-model/')?'/white-lab-bind-model/':'/';document.head.append(b)}</script>`, content:`<main id="main" class="not-found"><span class="error-code">404 / PAGE NOT FOUND</span><h1>찾으시는 문서가 없어요.</h1><p>주소가 변경되었거나 잘못 입력되었을 수 있습니다.<br>문서를 검색하거나 시작 화면으로 돌아가 보세요.</p><a class="button primary" href="./index.html">시작 화면으로 ${icon('arrow')}</a> <button class="button" data-search>문서 검색 ${icon('search')}</button></main>` }));
await build({ entryPoints:['scripts/diagrams.mjs'], bundle:true, minify:true, format:'iife', outfile:'docs/assets/diagrams.js', legalComments:'linked', target:['es2020'] });
await writeFile('plans/migration-manifest.json', JSON.stringify({ source:'10.문서.zip', pages:changes, internal:['9.ETC/환경 구성 노트.md','9.ETC/_ BindModel 소스.md','9.ETC/ETC.md'], images:5, sourceDiagrams:9, publishedDiagrams:8 },null,2)+'\n');
console.log(`Imported ${pages.length} HTML documents and 5 images; generated home and 404 pages.`);
