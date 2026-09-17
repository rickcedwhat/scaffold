import '@testing-library/jest-dom/vitest';

// Mock window.scrollTo for jsdom
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
