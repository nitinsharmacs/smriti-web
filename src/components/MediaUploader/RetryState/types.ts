import type { MediaItemType } from 'src/components/MediaUploader/types';

export interface RetryStateProps {
  achievedUploads: number;
  targetUploads: number;
  mediaItems: MediaItemType[];
  onRetry?: () => void;
}
