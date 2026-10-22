"""Validate published HTML, local assets, anchors, and search targets."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.links = []
        self.h1 = 0
        self.title = 0
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for attr in ('href', 'src'):
            if attrs.get(attr):
                self.links.append(attrs[attr])
        self.h1 += tag == 'h1'
        self.title += tag == 'title'


def main():
    files = sorted(DOCS.rglob('*.html'))
    parsed = {file: Page(file.read_text()) for file in files}
    errors = []

    def target(file, link):
        url = urlsplit(link)
        if url.scheme or url.netloc:
            return
        pathname = unquote(url.path)
        if pathname.startswith('/white-lab-bind-model/'):
            pathname = pathname[len('/white-lab-bind-model/'):]
            dest = DOCS / pathname
        elif pathname.startswith('/'):
            dest = DOCS / pathname.lstrip('/')
        else:
            dest = file.parent / pathname if pathname else file
        dest = dest.resolve()
        if dest.is_dir():
            dest /= 'index.html'
        if not dest.is_relative_to(DOCS):
            errors.append(f'{file.relative_to(DOCS)}: link outside docs: {link}')
        elif not dest.exists():
            errors.append(f'{file.relative_to(DOCS)}: missing target: {link}')
        elif url.fragment and dest in parsed and unquote(url.fragment) not in parsed[dest].ids:
            errors.append(f'{file.relative_to(DOCS)}: missing anchor: {link}')

    for file, page in parsed.items():
        html = file.read_text()
        if page.h1 != 1 or page.title != 1:
            errors.append(f'{file.relative_to(DOCS)}: expected one h1 and one title; found {page.h1}/{page.title}')
        if re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', html):
            errors.append(f'{file.relative_to(DOCS)}: control character')
        for leftover in ('![[', '#삭제대상', '%%'):
            if leftover in html:
                errors.append(f'{file.relative_to(DOCS)}: unprocessed source markup {leftover}')
        for name, count in Counter(page.ids).items():
            if count > 1:
                errors.append(f'{file.relative_to(DOCS)}: duplicate id: {name}')
        for link in page.links:
            target(file, link)
    manifest = json.loads((ROOT / 'plans/migration-manifest.json').read_text())
    if len(manifest['pages']) < 23:
        errors.append('Expected at least the 23 imported documents')
    for page in manifest['pages']:
        if not (ROOT / page['target']).exists():
            errors.append('Missing imported page: ' + page['target'])
    index = (DOCS / 'assets/search-index.js').read_text()
    entries = json.loads(index.removeprefix('window.BINDMODEL_SEARCH = ').strip().removesuffix(';'))
    for entry in entries:
        target(DOCS / 'index.html', entry['url'])
    for term in ('컬럼', '서비스 객체', 'JSON 스키마', 'BindCommand', 'execute', 'outputOption'):
        if not any(term.lower() in (e['title'] + ' ' + e['section'] + ' ' + e['text']).lower() for e in entries):
            errors.append('Missing search coverage: ' + term)
    for script in [DOCS / 'assets/site.js', *sorted((ROOT / 'scripts').glob('*.mjs'))]:
        result = subprocess.run(['node', '--check', str(script)], capture_output=True, text=True)
        if result.returncode:
            errors.append(result.stderr)
    if errors:
        print('\n'.join(errors))
        raise SystemExit(1)
    print(f'PASS: {len(files)} HTML pages, all local links/assets/anchors, {len(entries)} search targets, and JavaScript syntax.')


if __name__ == '__main__':
    main()
