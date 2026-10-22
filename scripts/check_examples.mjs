// Syntax-check snippets without executing requests or requiring a user's backend.
import fs from 'node:fs';
import { transform } from 'esbuild';
import MarkdownIt from 'markdown-it';

const decode = new MarkdownIt().utils.unescapeAll;
let total = 0;
const errors = [];
for (const file of fs.readdirSync('docs', { recursive: true }).filter(file => file.endsWith('.html'))) {
  let index = 0;
  for (const match of fs.readFileSync('docs/' + file, 'utf8').matchAll(/<code class="language-(js|javascript|ts|typescript)">([\s\S]*?)<\/code>/g)) {
    index++;
    total++;
    const code = decode(match[2].replace(/<[^>]+>/g, ''));
    try { await transform(code, { loader: match[1].startsWith('t') ? 'ts' : 'js', logLevel: 'silent' }); }
    catch (error) { errors.push(`${file}, snippet ${index}: ${error.errors[0].text}`); }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`PASS: syntax of ${total} JavaScript / TypeScript snippets. Type checking and server behavior are outside this check.`);
