import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InProgressState from 'src/components/MediaUploader/InProgressState/InProgressState';
import {
  MediaType,
  MediaUploadStatus,
} from 'src/components/MediaUploader/types';
import { describe, expect, it, vi } from 'vitest';

describe('InProgressState', () => {
  it('should render progress state', () => {
    const { container } = render(
      <InProgressState achievedUploads={0} targetUploads={2} mediaItems={[]} />
    );
    expect(container).toMatchSnapshot();
  });

  it('should show more/less', async () => {
    render(
      <InProgressState
        achievedUploads={0}
        targetUploads={2}
        mediaItems={[
          {
            id: '123',
            type: MediaType.Image,
            status: MediaUploadStatus.InProgress,
            progress: 12,
            name: 'image.png',
          },
          {
            id: '1234',
            type: MediaType.Video,
            status: MediaUploadStatus.InProgress,
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

  it('should stop progress', async () => {
    const stopMock = vi.fn();

    render(
      <InProgressState
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
        onStop={stopMock}
      />
    );

    const stopBtn = screen.getAllByRole('button')[0];

    await userEvent.click(stopBtn);

    expect(stopMock).toHaveBeenCalledOnce();
  });
});
