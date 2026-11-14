import { describe, expect, it } from 'vitest';
import { InvalidTokenError } from '../errors.js';

describe('InvalidTokenError', () => {
  it('defaults to an unknown reason for backward compatibility', () => {
    const error = new InvalidTokenError('Token rejected');

    expect(error.reason).toBe('unknown');
    expect(error.message).toContain('Token rejected');
  });

  it('preserves an explicit reason', () => {
    const error = new InvalidTokenError('Token expired', 'expired');

    expect(error.reason).toBe('expired');
  });
});
