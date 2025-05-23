import { beforeEach, afterEach, vi } from 'vitest';

// Mock fetch before each test
beforeEach(() => {
  global.fetch = vi.fn();
});

// Clear mocks after each test
afterEach(() => {
  vi.resetAllMocks();
});