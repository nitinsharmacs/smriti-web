import { render } from '@testing-library/react';
import MediaItem from 'src/components/MediaUploader/MediaItem/MediaItem';
import {
  MediaType,
  MediaUploadStatus,
} from 'src/components/MediaUploader/types';
import { describe, expect, it } from 'vitest';

describe('MediaItem', () => {
  it('should render success image media item', () => {
    const { container } = render(
      <MediaItem
        name={''}
        type={MediaType.Image}
        status={MediaUploadStatus.Success}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render success video media item', () => {
    const { container } = render(
      <MediaItem
        name={''}
        type={MediaType.Video}
        status={MediaUploadStatus.Success}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render failed image media item', () => {
    const { container } = render(
      <MediaItem
        name={''}
        type={MediaType.Image}
        status={MediaUploadStatus.Failed}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render failed video media item', () => {
    const { container } = render(
      <MediaItem
        name={''}
        type={MediaType.Video}
        status={MediaUploadStatus.Failed}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render progress image media item', () => {
    const { container } = render(
      <MediaItem
        name={''}
        type={MediaType.Image}
        status={MediaUploadStatus.InProgress}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render progress video media item', () => {
    const { container } = render(
      <MediaItem
        name={''}
        type={MediaType.Video}
        status={MediaUploadStatus.InProgress}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
