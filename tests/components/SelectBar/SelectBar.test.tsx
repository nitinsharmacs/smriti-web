import { render } from '@testing-library/react';
import SelectBar from 'src/components/SelectBar/SelectBar';
import { describe, expect, it } from 'vitest';

describe('SelectBar', () => {
  it('should match snapshot', () => {
    const { container } = render(<SelectBar />);
    expect(container).toMatchSnapshot();
  });
});
