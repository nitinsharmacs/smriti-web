import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

vi.stubGlobal(
  'IntersectionObserver',
  vi.fn().mockImplementation(() => {
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  })
);

// runs a cleanup after each test case. such as clearing jsdom.
afterEach(() => {
  cleanup();
});
