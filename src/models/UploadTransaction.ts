import {
  MediaType,
  MediaUploadStatus,
  UploadTxnStatus,
  type CompletedStateType,
  type InProgressStateType,
  type MediaItemType,
  type RetryStateType,
  type UploadTxnState,
  type UploadTxnType,
} from 'src/components/MediaUploader/types';

export type ProgressStats = {
  [key: string]: number;
};

export type FileType = {
  id: string;
  name: string;
  type: string;
};

class UploadTransaction {
  private _txnId: string;
  private txnState: InProgressStateType | RetryStateType | CompletedStateType;
  private _status: UploadTxnStatus;

  constructor(txnId: string, files: FileType[]) {
    this._txnId = txnId;
    this._status = UploadTxnStatus.InProgress;
    this.txnState = UploadTransaction.createProgressState(files);
  }

  static createProgressState(files: FileType[]): InProgressStateType {
    const mediaItems: MediaItemType[] = files.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.type.startsWith('image/') ? MediaType.Image : MediaType.Video,
      progress: 0,
      status: MediaUploadStatus.InProgress,
    }));

    return {
      targetUploads: mediaItems.length,
      achievedUploads: 0,
      mediaItems,
    };
  }

  createCompleteState(): CompletedStateType {
    return {
      targetUploads: this.txnState.targetUploads,
      achievedUploads: this.txnState.targetUploads,
      previews: [
        'https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k',
      ],
    };
  }

  createRetryState(): RetryStateType {
    return {
      ...this.txnState,
      mediaItems: this.getPendingMedia().map((item) => ({
        ...item,
        status: MediaUploadStatus.Failed,
      })),
      previews: [
        'https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k',
      ],
    };
  }

  updateMediaProgresses(progresses: ProgressStats): void {
    const state = this.txnState as InProgressStateType;

    state.mediaItems.forEach((item) => {
      if (item.progress === 100) return;
      item.progress = Math.min(100, progresses[item.id]);

      if (item.progress === 100) {
        item.status = MediaUploadStatus.Success;
        state.achievedUploads += 1;
      }
    });
  }

  private getPendingMedia(): MediaItemType[] {
    const state = this.txnState as InProgressStateType;
    return state.mediaItems.filter((item) => item.progress < 100);
  }

  getFailedMediaIds(): string[] {
    if (this._status !== UploadTxnStatus.Retry) {
      return [];
    }

    const state = this.txnState as RetryStateType;

    return state.mediaItems.map((item) => item.id);
  }

  complete(): boolean {
    if (this._status !== UploadTxnStatus.InProgress) return false;

    if (this.txnState.achievedUploads === this.txnState.targetUploads) {
      this.txnState = this.createCompleteState();
      this._status = UploadTxnStatus.Success;
      return true;
    }

    return false;
  }

  completePartially(): boolean {
    if (this._status !== UploadTxnStatus.Retry) return false;

    const state = this.txnState as RetryStateType;

    this.txnState = {
      targetUploads: state.targetUploads,
      achievedUploads: state.achievedUploads,
      previews: state.previews,
    };

    this._status = UploadTxnStatus.Success;

    return true;
  }

  stop(): boolean {
    if (this._status === UploadTxnStatus.Retry) return false;

    this.txnState = this.createRetryState();
    this._status = UploadTxnStatus.Retry;

    return true;
  }

  anyFileUploaded(): boolean {
    return this.txnState.achievedUploads > 0;
  }

  getObject(): UploadTxnType {
    return {
      txnId: this._txnId,
      state: { ...this.txnState },
      status: this._status,
    };
  }

  public get txnId(): string {
    return this._txnId;
  }

  public get state(): UploadTxnState {
    return { ...this.txnState };
  }

  public get status(): UploadTxnStatus {
    return this._status;
  }
}

export default UploadTransaction;
