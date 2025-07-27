import type {
  MediaType,
  MediaUploadStatus,
} from 'src/components/MediaUploader/types';

export interface MediaItemProps {
  name: string;
  type: MediaType;
  status: MediaUploadStatus;
  progress?: number; // valid for media status "InProgress"
}
