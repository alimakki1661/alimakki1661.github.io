# alimakki1661.github.io

[![Tests](https://github.com/alimakki1661/alimakki1661.github.io/actions/workflows/test.yml/badge.svg)](https://github.com/alimakki1661/alimakki1661.github.io/actions/workflows/test.yml)

My developer portfolio, live at [alimakki1661.github.io](https://alimakki1661.github.io/) and deployed with GitHub Pages.

## Tests

Unit tests run with [Vitest](https://vitest.dev/) and jsdom. A [Husky](https://typicode.github.io/husky/) pre-commit hook runs them before every commit and blocks the commit if any fail, and GitHub Actions runs them again on every push and pull request to `main`.

- `tests/copy-email.test.js` covers the "Copy email" button: the Clipboard API path, the fallback for browsers that block it, and the label reset.
- `tests/site.test.js` checks `index.html`: every local link and image exists, every in-page anchor has a section, images have alt text and sizes, new-tab links use `rel="noopener"`, and the resume stays one page.

Run them locally:

```bash
npm install       # also installs the Husky pre-commit hook
npm test          # run once
npm run test:watch  # rerun on save
```
