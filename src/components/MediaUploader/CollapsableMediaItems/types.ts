import type { MediaItemType } from 'src/components/MediaUploader/types';

export interface CollapsableMediaItemsProps {
  open: boolean;
  mediaItems: MediaItemType[];
}
