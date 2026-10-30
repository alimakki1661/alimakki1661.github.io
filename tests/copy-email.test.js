// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  copyText,
  initCopyEmail,
  EMAIL,
  DEFAULT_LABEL,
  COPIED_LABEL,
  RESET_DELAY_MS,
} from '../js/copy-email.js';

const clipboardThatWorks = () => ({ clipboard: { writeText: vi.fn().mockResolvedValue() } });
const clipboardThatFails = () => ({
  clipboard: { writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')) },
});

// Let the async click handler finish.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  document.body.innerHTML = `<button id="copy-email">${DEFAULT_LABEL}</button>`;
  document.execCommand = vi.fn(() => true);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('copyText', () => {
  it('uses the Clipboard API when it is available', async () => {
    const nav = clipboardThatWorks();
    const result = await copyText(EMAIL, document, nav);

    expect(result).toBe('clipboard');
    expect(nav.clipboard.writeText).toHaveBeenCalledWith(EMAIL);
    expect(document.execCommand).not.toHaveBeenCalled();
  });

  it('falls back to execCommand when the Clipboard API rejects', async () => {
    const result = await copyText(EMAIL, document, clipboardThatFails());

    expect(result).toBe('fallback');
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('falls back when the browser has no Clipboard API at all', async () => {
    const result = await copyText(EMAIL, document, {});

    expect(result).toBe('fallback');
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('removes the temporary textarea after copying', async () => {
    await copyText(EMAIL, document, clipboardThatFails());

    expect(document.querySelector('textarea')).toBeNull();
  });
});

describe('initCopyEmail', () => {
  it('returns false and does nothing when the button is missing', () => {
    expect(initCopyEmail(null)).toBe(false);
  });

  it('copies the email and shows a confirmation when clicked', async () => {
    const button = document.getElementById('copy-email');
    const nav = clipboardThatWorks();
    initCopyEmail(button, { nav });

    button.click();
    await flush();

    expect(nav.clipboard.writeText).toHaveBeenCalledWith(EMAIL);
    expect(button.textContent).toBe(COPIED_LABEL);
  });

  it('resets the button label after the delay', async () => {
    vi.useFakeTimers();
    const button = document.getElementById('copy-email');
    initCopyEmail(button, { nav: clipboardThatWorks() });

    button.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(button.textContent).toBe(COPIED_LABEL);

    await vi.advanceTimersByTimeAsync(RESET_DELAY_MS - 1);
    expect(button.textContent).toBe(COPIED_LABEL);

    await vi.advanceTimersByTimeAsync(1);
    expect(button.textContent).toBe(DEFAULT_LABEL);
  });
});
