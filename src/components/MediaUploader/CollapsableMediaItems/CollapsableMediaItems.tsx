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
        </div>
      </Collapse>
    </div>
  );
};

export default CollapsableMediaItems;
