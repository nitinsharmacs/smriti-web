export enum MediaType {
  Image,
  Video,
}

export enum MediaUploadStatus {
  Success,
  Failed, // for failed, cancelled etc.
  InProgress,
}

export interface MediaItemProps {
  name: string;
  type: MediaType;
  status: MediaUploadStatus;
  progress?: number; // valid for media status "InProgress"
}
