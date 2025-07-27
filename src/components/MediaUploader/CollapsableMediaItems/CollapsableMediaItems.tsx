import Collapse from '@mui/material/Collapse';
import { useRef } from 'react';
import type { CollapsableMediaItemsProps } from 'src/components/MediaUploader/CollapsableMediaItems/types';
import MediaItem from 'src/components/MediaUploader/MediaItem/MediaItem';
import { MediaType, MediaUploadStatus } from '../types';

import './collapsablemediaitems.css';

const CollapsableMediaItems = ({
  open,
  mediaItems,
}: CollapsableMediaItemsProps) => {
  const uploadItemsRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={uploadItemsRef}
      className='collapsable-media-items'
      style={{ marginTop: open ? '1em' : '' }}
    >
      <Collapse in={open} timeout='auto' unmountOnExit>
        <div>
          {mediaItems.map((item) => (
            <MediaItem
              name={item.name}
              type={item.type}
              status={item.status}
              progress={item.progress}
            />
          ))}
          {/* <MediaItem
            name='screenshot.jpeg'
            type={MediaType.Image}
            status={MediaUploadStatus.InProgress}
            progress={50}
          />
          <MediaItem
            name='screenshot.jpeg'
            type={MediaType.Image}
            status={MediaUploadStatus.InProgress}
            progress={50}
          />
          <MediaItem
            name='screenshot.jpeg'
            type={MediaType.Image}
            status={MediaUploadStatus.Success}
          />
          <MediaItem
            name='screenshot.jpeg'
            type={MediaType.Image}
            status={MediaUploadStatus.Success}
          />
          <MediaItem
            name='screenshot.jpeg'
            type={MediaType.Image}
            status={MediaUploadStatus.InProgress}
            progress={80}
          />
          <MediaItem
            name='screenshot.jpeg'
            type={MediaType.Image}
            status={MediaUploadStatus.Failed}
          />
          <MediaItem
            name='screenshot.jpeg'
            type={MediaType.Image}
            status={MediaUploadStatus.Failed}
          /> */}
        </div>
      </Collapse>
    </div>
  );
};

export default CollapsableMediaItems;
