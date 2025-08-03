import { render } from '@testing-library/react';
import CollapsableMediaItems from 'src/components/MediaUploader/CollapsableMediaItems/CollapsableMediaItems';
import {
  MediaType,
  MediaUploadStatus,
} from 'src/components/MediaUploader/types';
import { describe, expect, it } from 'vitest';

describe('CollapsableMediaItems', () => {
  it('should render collapsable media items', () => {
    const { container } = render(
      <CollapsableMediaItems
        open={true}
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

    expect(container).toMatchSnapshot();
  });
});
