import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE_URL = 'https://alimakki1661.github.io/';
const html = readFileSync(`${ROOT}/index.html`, 'utf8');
const { document } = new JSDOM(html).window;

const all = (selector) => [...document.querySelectorAll(selector)];
const isExternal = (url) => /^(https?:|mailto:|tel:)/.test(url);
const stripQuery = (url) => url.split(/[?#]/)[0];

describe('index.html', () => {
  it('has a title and a meta description', () => {
    expect(document.title.trim()).not.toBe('');
    const description = document.querySelector('meta[name="description"]');
    expect(description?.content.trim()).toBeTruthy();
  });

  it('only links to local files that exist', () => {
    const urls = all('[href], [src]')
      .map((el) => el.getAttribute('href') ?? el.getAttribute('src'))
      .filter((url) => url && !url.startsWith('#') && !isExternal(url));

    const missing = urls.filter((url) => !existsSync(`${ROOT}/${stripQuery(url)}`));
    expect(missing).toEqual([]);
  });

  it('has a matching section for every in-page anchor', () => {
    const anchors = all('a[href^="#"]').map((a) => a.getAttribute('href').slice(1));
    const missing = anchors.filter((id) => !document.getElementById(id));
    expect(missing).toEqual([]);
  });

  it('gives every image alt text and dimensions', () => {
    for (const img of all('img')) {
      expect(img.getAttribute('alt')?.trim(), img.src).toBeTruthy();
      expect(img.getAttribute('width'), img.src).toBeTruthy();
      expect(img.getAttribute('height'), img.src).toBeTruthy();
    }
  });

  it('uses rel="noopener" on links that open a new tab', () => {
    const unsafe = all('a[target="_blank"]').filter(
      (a) => !(a.getAttribute('rel') ?? '').includes('noopener'),
    );
    expect(unsafe.map((a) => a.href)).toEqual([]);
  });

  it('has a link-preview image that exists in the repo', () => {
    const ogImage = document.querySelector('meta[property="og:image"]')?.content ?? '';
    expect(ogImage.startsWith(SITE_URL)).toBe(true);
    expect(existsSync(`${ROOT}/${ogImage.slice(SITE_URL.length)}`)).toBe(true);
  });

  it('loads the copy-email script and has its button', () => {
    expect(document.querySelector('script[type="module"][src="js/copy-email.js"]')).not.toBeNull();
    expect(document.getElementById('copy-email')).not.toBeNull();
  });
});

describe('resume', () => {
  const resumeLinks = all('a[href*="ali-makki-resume.pdf"]').map((a) => a.getAttribute('href'));

  it('every resume button points to the same version of the PDF', () => {
    expect(resumeLinks.length).toBeGreaterThan(0);
    expect(new Set(resumeLinks).size).toBe(1);
  });

  it('is a single-page PDF', () => {
    const pdf = readFileSync(`${ROOT}/${stripQuery(resumeLinks[0])}`, 'latin1');
    expect(pdf.startsWith('%PDF')).toBe(true);
    const pages = pdf.match(/\/Type\s*\/Page(?![a-zA-Z])/g) ?? [];
    expect(pages.length).toBe(1);
  });
});
