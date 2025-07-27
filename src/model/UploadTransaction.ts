import {
  MediaType,
  MediaUploadStatus,
  UploadTxnStatus,
  type CompletedStateType,
  type InProgressStateType,
  type RetryStateType,
  type UploadTxnState,
  type UploadTxnType,
} from 'src/components/MediaUploader/types';

export type cb = () => void;

class UploadTransaction {
  private files: FileList;
  private _txnId: string;
  private txnState: InProgressStateType | RetryStateType | CompletedStateType;
  private status: UploadTxnStatus;
  private interval: number | undefined;
  private timeout: number | undefined;

  constructor(files: FileList) {
    this.files = files;
  }

  createProgressState(): InProgressStateType {
    return {
      targetUploads: 4,
      achievedUploads: 2,
      mediaItems: [
        {
          type: MediaType.Image,
          name: 'screenshot.jpeg',
          status: MediaUploadStatus.InProgress,
          progress: 10,
        },
        {
          type: MediaType.Image,
          name: 'screenshot2.jpeg',
          status: MediaUploadStatus.InProgress,
          progress: 50,
        },
      ],
    };
  }

  startUpload(): void {
    // start upload using upload service;
    this._txnId = 'txn1';
    this.txnState = this.createProgressState();
    this.status = UploadTxnStatus.InProgress;
  }

  onProgress(cb: cb): void {
    // call cb on progress
    this.interval = setInterval(() => {
      const state = this.txnState as InProgressStateType;
      state.mediaItems.forEach((item) => {
        if (item.progress < 100) item.progress += 10;
      });
      cb();
    }, 1500);

    setTimeout(() => {
      clearInterval(this.interval);
    }, 15000);
  }

  createCompleteState(): CompletedStateType {
    return {
      targetUploads: 4,
      achievedUploads: 4,
      previews: [
        'https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k',
      ],
    };
  }

  onComplete(cb: cb): void {
    // call cb on complete
    this.timeout = setTimeout(() => {
      this.txnState = this.createCompleteState();
      this.status = UploadTxnStatus.Success;
      cb();
    }, 15500);
  }

  createRetryState(): RetryStateType {
    return {
      targetUploads: 4,
      achievedUploads: 2,
      mediaItems: [
        {
          type: MediaType.Image,
          name: 'screenshot.jpeg',
          status: MediaUploadStatus.Failed,
          progress: 10,
        },
        {
          type: MediaType.Image,
          name: 'screenshot 2.jpeg',
          status: MediaUploadStatus.Failed,
          progress: 10,
        },
      ],
      previews: [
        'https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k',
      ],
    };
  }

  stop(): void {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    this.txnState = this.createRetryState();
    this.status = UploadTxnStatus.Retry;
  }

  getObject(): UploadTxnType {
    return {
      txnId: this._txnId,
      state: this.txnState,
      status: this.status,
    };
  }

  public get txnId(): string {
    return this._txnId;
  }
}

export default UploadTransaction;
