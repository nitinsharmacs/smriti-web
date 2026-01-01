import type { UploadTxnType } from 'src/components/MediaUploader/types';

export type UploadTxnControl = (txnId: string, origin?: CancelOrigin) => void;
export enum CancelOrigin {
  Completed,
  RetryCompleted,
  Retry,
}

export interface UploadTxnProps extends UploadTxnType {
  onStop: UploadTxnControl;
  onComplete: UploadTxnControl;
  onRetry: UploadTxnControl;
  onCancel: UploadTxnControl;
}
