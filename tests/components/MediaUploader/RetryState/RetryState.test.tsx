import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RetryState from 'src/components/MediaUploader/RetryState/RetryState';
import {
  MediaType,
  MediaUploadStatus,
} from 'src/components/MediaUploader/types';
import { describe, expect, it, vi } from 'vitest';

describe('RetryState', () => {
  it('should render retry state', () => {
    const { container } = render(
      <RetryState achievedUploads={0} targetUploads={0} mediaItems={[]} />
    );
    expect(container).toMatchSnapshot();
  });

  it('should show more/less', async () => {
    render(
      <RetryState
        achievedUploads={0}
        targetUploads={2}
        mediaItems={[
          {
            id: '123',
            type: MediaType.Image,
            status: MediaUploadStatus.Failed,
            progress: 12,
            name: 'image.png',
          },
          {
            id: '1234',
            type: MediaType.Video,
            status: MediaUploadStatus.Failed,
            progress: 40,
            name: 'video.mp4',
          },
        ]}
      />
    );

    const showMoreBtn = screen.getAllByRole('button')[1];

    expect(screen.queryByText('image.png')).not.toBeInTheDocument();
    expect(screen.queryByText('video.mp4')).not.toBeInTheDocument();

    expect(showMoreBtn.textContent).toBe('Show more');

    await userEvent.click(showMoreBtn);

    expect(showMoreBtn.textContent).toBe('Show less');
    expect(screen.getByText('image.png')).toBeInTheDocument();
    expect(screen.getByText('video.mp4')).toBeInTheDocument();
  });

  it('should retry upload', async () => {
    const retryMock = vi.fn();

    render(
      <RetryState
        achievedUploads={0}
        targetUploads={1}
        mediaItems={[
          {
            id: '123',
            type: MediaType.Image,
            status: MediaUploadStatus.InProgress,
            progress: 12,
            name: 'image.png',
          },
        ]}
        onRetry={retryMock}
      />
    );

    const retryBtn = screen.getAllByRole('button')[0];

    await userEvent.click(retryBtn);

    expect(retryMock).toHaveBeenCalledOnce();
  });
});
