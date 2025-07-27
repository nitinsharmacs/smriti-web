import type { UploadTxnType } from 'src/components/MediaUploader/types';

export type UploadTxnControl = (txnId: string) => void;

export interface UploadTxnProps extends UploadTxnType {
  onStop: UploadTxnControl;
  onComplete: UploadTxnControl;
  onRetry: UploadTxnControl;
}
