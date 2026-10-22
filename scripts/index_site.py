"""Refresh search data and sitemap after editing the published HTML files."""
from html.parser import HTMLParser
from pathlib import Path
from xml.sax.saxutils import escape
import argparse
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
DEFAULT_URL = 'https://white-base.github.io/white-lab-bind-model/'


class ContentParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.active = False
        self.depth = 0
        self.ignored = 0
        self.heading = False
        self.section = ''
        self.anchor = ''
        self.parts = []
        self.heading_parts = []
        self.sections = []

    def flush(self):
        text = re.sub(r'\s+', ' ', ' '.join(self.parts)).strip()
        if text:
            self.sections.append({'section': self.section, 'anchor': self.anchor, 'text': text})
        self.parts = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'article' and 'data-search-content' in attrs:
            self.active = True
        if not self.active:
            return
        if tag in ('button', 'script', 'style') or 'heading-anchor' in attrs.get('class', '').split():
            self.ignored += 1
        if tag in ('h2', 'h3'):
            self.flush()
            self.heading = True
            self.heading_parts = []
            self.anchor = attrs.get('id', '')

    def handle_endtag(self, tag):
        if not self.active:
            return
        if tag in ('button', 'script', 'style') and self.ignored:
            self.ignored -= 1
        elif tag == 'a' and self.ignored:
            self.ignored -= 1
        if tag in ('h2', 'h3'):
            self.section = ''.join(self.heading_parts).strip()
            self.heading = False
        if tag == 'article':
            self.flush()
            self.active = False

    def handle_data(self, data):
        if self.active and not self.ignored:
            self.parts.append(data)
            if self.heading:
                self.heading_parts.append(data)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default=DEFAULT_URL)
    args = parser.parse_args()
    base = args.base_url.rstrip('/') + '/'
    manifest = json.loads((ROOT / 'plans/migration-manifest.json').read_text())
    group_names = {'guide/features': '기능 가이드', 'guide': '시작하기', 'advanced': '고급 기능', 'examples': '예제', 'api': 'API 레퍼런스'}
    entries = []
    for page in manifest['pages']:
        file = ROOT / page['target']
        html = file.read_text()
        title = re.search(r'<h1>(.*?)</h1>', html, re.S).group(1)
        p = ContentParser()
        p.feed(html)
        rel = file.relative_to(DOCS).as_posix()
        group = next(name for prefix, name in group_names.items() if rel.startswith(prefix + '/'))
        for section in p.sections:
            entries.append({'title': title, 'group': group, 'section': section['section'] or title,
                            'url': rel + ('#' + section['anchor'] if section['anchor'] else ''), 'text': section['text']})
    (DOCS / 'assets/search-index.js').write_text('window.BINDMODEL_SEARCH = ' + json.dumps(entries, ensure_ascii=False, separators=(',', ':')) + ';\n')
    urls = []
    for file in sorted(DOCS.rglob('*.html')):
        rel = file.relative_to(DOCS).as_posix()
        if rel == '404.html':
            continue
        url = base + ('' if rel == 'index.html' else rel)
        html = file.read_text()
        html = re.sub(r'(<link rel="canonical" href=")[^"]+', lambda m: m[1] + url, html)
        html = re.sub(r'(<meta property="og:url" content=")[^"]+', lambda m: m[1] + url, html)
        html = re.sub(r'(<meta property="og:image" content=")[^"]+', lambda m: m[1] + base + 'assets/social.svg', html)
        file.write_text(html)
        urls.append(url)
    (DOCS / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{escape(url)}</loc></url>\n' for url in urls) + '</urlset>\n')
    (DOCS / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {base}sitemap.xml\n')
    print(f'Indexed {len(manifest["pages"])} documents / {len(entries)} sections; sitemap has {len(urls)} pages.')


if __name__ == '__main__':
    main()
