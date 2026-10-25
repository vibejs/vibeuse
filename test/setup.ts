import { afterEach, vi } from 'vitest';
afterEach(() => {
  vi.useRealTimers();
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
  }
});
