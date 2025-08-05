import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompleteState from 'src/components/MediaUploader/CompleteState/CompleteState';
import { describe, expect, it, vi } from 'vitest';

describe('CompleteState', () => {
  it('should render complete state', () => {
    const { container } = render(
      <CompleteState
        targetUploads={2}
        achievedUploads={2}
        previews={['/preview']}
        onComplete={function (): void {
          throw new Error('Function not implemented.');
        }}
      />
    );

    expect(container).toMatchSnapshot();
  });

  it('should render partially complete state', () => {
    const { container } = render(
      <CompleteState
        targetUploads={2}
        achievedUploads={1}
        previews={['/preview']}
        onComplete={function (): void {
          throw new Error('Function not implemented.');
        }}
      />
    );

    expect(container).toMatchSnapshot();
  });

  it('should invoke complete', async () => {
    const completeMock = vi.fn();
    render(
      <CompleteState
        targetUploads={2}
        achievedUploads={1}
        previews={['/preview']}
        onComplete={completeMock}
      />
    );

    const completeBtn = screen.getByRole('button');

    await userEvent.click(completeBtn);

    expect(completeMock).toHaveBeenCalledOnce();
  });
});
