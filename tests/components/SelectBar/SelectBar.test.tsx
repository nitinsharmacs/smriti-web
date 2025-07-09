import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import SelectBar from 'src/components/SelectBar/SelectBar';

describe('SelectBar', () => {
  it('should match snapshot', () => {
    const { container } = render(
      <SelectBar
        open={false}
        onClose={vi.fn()}
        controls={[{ handler: vi.fn() }]}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should click select bar control', async () => {
    const handlerMock = vi.fn();
    render(
      <SelectBar
        open={true}
        onClose={vi.fn()}
        controls={[{ handler: handlerMock }]}
      />
    );

    const handlerBtn = screen.getAllByRole('button')[1];

    await userEvent.click(handlerBtn);

    expect(handlerMock).toHaveBeenCalledOnce();
  });

  it('should click select bar close button', async () => {
    const closeMock = vi.fn();
    render(
      <SelectBar
        open={true}
        onClose={closeMock}
        controls={[{ handler: vi.fn() }]}
      />
    );

    const closeBtn = screen.getAllByRole('button')[0];

    await userEvent.click(closeBtn);

    expect(closeMock).toHaveBeenCalledOnce();
  });
});
