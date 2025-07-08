import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from 'src/App';

vi.stubGlobal(
  'IntersectionObserver',
  vi.fn().mockImplementation(() => {
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  })
);

describe('App', () => {
  it('should render App', () => {});
});
