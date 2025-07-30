import type { ReactNode } from 'react';

export type UploadTxnCreator = (files: FileList) => void;

export interface ProviderContext {
  createUploadTxn: UploadTxnCreator;
}

export interface ProviderProps {
  children?: ReactNode | ReactNode[];
  domRoot?: HTMLElement;
}

export enum UploadTxnStatus {
  Success,
  Retry, // for failed, cancelled etc.
  InProgress,
}

export type UploadTxnState = {
  targetUploads: number;
  achievedUploads: number;
};

export type MediaItemType = {
  type: MediaType;
  name: string;
  status: MediaUploadStatus;
  progress: number;
  file?: File;
};

export type InProgressStateType = UploadTxnState & {
  mediaItems: MediaItemType[];
};

export type CompletedStateType = UploadTxnState & {
  previews: string[];
};

export type RetryStateType = InProgressStateType & CompletedStateType & {};

export type UploadTxnType = {
  txnId: string;
  status: UploadTxnStatus;
  state: InProgressStateType | RetryStateType | CompletedStateType;
};

export enum MediaType {
  Image,
  Video,
}

export enum MediaUploadStatus {
  Success,
  Failed, // for failed, cancelled etc.
  InProgress,
}
