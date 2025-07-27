import type { MediaItemType } from 'src/components/MediaUploader/types';

export interface InProgressStateProps {
  achievedUploads: number;
  targetUploads: number;
  mediaItems: MediaItemType[];
  onStop?: () => void;
}
