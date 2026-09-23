import '@testing-library/jest-dom/vitest';

// Radix UI JSDOM polyfills
if (typeof window !== 'undefined') {
  window.PointerEvent = window.PointerEvent || (window.MouseEvent as unknown as typeof PointerEvent);
  window.HTMLElement.prototype.scrollIntoView =
    window.HTMLElement.prototype.scrollIntoView || (() => {});
  window.HTMLElement.prototype.hasPointerCapture =
    window.HTMLElement.prototype.hasPointerCapture || (() => false);
  window.HTMLElement.prototype.releasePointerCapture =
    window.HTMLElement.prototype.releasePointerCapture || (() => {});
}
