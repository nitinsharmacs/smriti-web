import { render } from '@testing-library/react';
import Photos from 'src/screens/Photos/Photos';
import { describe, it } from 'vitest';

describe('Photos', () => {
  it('should show photos grid', () => {
    render(<Photos />);
  });
});
