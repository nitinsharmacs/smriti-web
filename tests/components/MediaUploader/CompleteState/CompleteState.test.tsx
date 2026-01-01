import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompleteState from 'src/components/MediaUploader/CompleteState/CompleteState';
import { doNothing } from 'src/helpers';
import { describe, expect, it, vi } from 'vitest';

describe('CompleteState', () => {
  it('should render complete state', () => {
    const { container } = render(
      <CompleteState
        targetUploads={2}
        achievedUploads={2}
        previews={['/preview']}
        onCancel={doNothing}
        onComplete={doNothing}
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
        onCancel={doNothing}
        onComplete={doNothing}
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
        onCancel={doNothing}
        onComplete={completeMock}
      />
    );

    const [completeBtn, ..._] = screen.getAllByRole('button');

    await userEvent.click(completeBtn);

    expect(completeMock).toHaveBeenCalledOnce();
  });

  it('should invoke cancel', async () => {
    const cancelMock = vi.fn();
    render(
      <CompleteState
        targetUploads={2}
        achievedUploads={1}
        previews={['/preview']}
        onComplete={doNothing}
        onCancel={cancelMock}
      />
    );

    const [cancelBtn, ..._] = screen.getAllByRole('button').reverse();

    await userEvent.click(cancelBtn);

    expect(cancelMock).toHaveBeenCalledOnce();
  });
});
