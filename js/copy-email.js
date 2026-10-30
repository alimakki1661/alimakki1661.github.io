// "Copy email" button: copies the address with the Clipboard API, and falls
// back to a hidden <textarea> + execCommand on browsers that block it.

export const EMAIL = 'alimakki1661@gmail.com';
export const DEFAULT_LABEL = 'Copy email';
export const COPIED_LABEL = 'Email copied ✓';
export const RESET_DELAY_MS = 2200;

export async function copyText(text, doc = document, nav = navigator) {
  try {
    await nav.clipboard.writeText(text);
    return 'clipboard';
  } catch {
    const field = doc.createElement('textarea');
    field.value = text;
    field.style.position = 'fixed';
    field.style.opacity = '0';
    doc.body.appendChild(field);
    field.select();
    doc.execCommand('copy');
    field.remove();
    return 'fallback';
  }
}

export function initCopyEmail(button, { email = EMAIL, doc = document, nav = navigator } = {}) {
  if (!button) return false;
  button.addEventListener('click', async () => {
    await copyText(email, doc, nav);
    button.textContent = COPIED_LABEL;
    setTimeout(() => { button.textContent = DEFAULT_LABEL; }, RESET_DELAY_MS);
  });
  return true;
}

initCopyEmail(document.getElementById('copy-email'));
