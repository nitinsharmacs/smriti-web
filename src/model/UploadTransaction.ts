import {
  MediaType,
  MediaUploadStatus,
  UploadTxnStatus,
  type CompletedStateType,
  type InProgressStateType,
  type MediaItemType,
  type RetryStateType,
  type UploadTxnType,
} from 'src/components/MediaUploader/types';

export type cb = () => void;

export type FileType = {
  name: string;
  type: MediaType;
};

class UploadTransaction {
  private _txnId: string;
  private txnState: InProgressStateType | RetryStateType | CompletedStateType;
  private status: UploadTxnStatus;

  constructor(txnId: string, files: FileList) {
    this._txnId = txnId;
    this.txnState = this.createProgressState(files);
    this.status = UploadTxnStatus.InProgress;
  }

  createProgressState(files: FileList): InProgressStateType {
    const mediaItems: MediaItemType[] = [];

    for (const file of files) {
      mediaItems.push({
        name: file.name,
        progress: 0,
        status: MediaUploadStatus.InProgress,
        type: file.type.startsWith('image/')
          ? MediaType.Image
          : MediaType.Video,
        file,
      });
    }

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
      mediaItems: this.getPendingMedia(),
      previews: [
        'https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k',
      ],
    };
  }

  updateMediaProgresses(progresses: number[]): void {
    const state = this.txnState as InProgressStateType;

    state.mediaItems.forEach((item, index) => {
      if (item.progress === 100) return;
      item.progress = progresses[index];

      if (item.progress === 100) {
        state.achievedUploads += 1;
      }
    });
  }

  getPendingMedia(): MediaItemType[] {
    const state = this.txnState as InProgressStateType;
    return state.mediaItems
      .filter((item) => item.progress < 100)
      .map((item) => ({
        ...item,
        progress: 0,
        status: MediaUploadStatus.Failed,
      }));
  }

  getFailedMediaFiles(): FileList {
    const dataTransfer = new DataTransfer();

    if (this.status !== UploadTxnStatus.Retry) {
      return dataTransfer.files;
    }

    const state = this.txnState as RetryStateType;

    state.mediaItems.forEach(
      (media) => media.file && dataTransfer.items.add(media.file)
    );

    return dataTransfer.files;
  }

  complete(): boolean {
    const state = this.txnState as InProgressStateType;

    if (state.mediaItems.every((item) => item.progress === 100)) {
      this.txnState = this.createCompleteState();
      this.status = UploadTxnStatus.Success;
      return true;
    }

    return false;
  }

  completePartially(): boolean {
    if (this.status !== UploadTxnStatus.Retry) return false;

    const state = this.txnState as RetryStateType;

    this.txnState = {
      targetUploads: state.targetUploads,
      achievedUploads: state.achievedUploads,
      previews: state.previews,
    };

    this.status = UploadTxnStatus.Success;

    return true;
  }

  stop(): void {
    this.txnState = this.createRetryState();
    this.status = UploadTxnStatus.Retry;
  }

  anyFileUploaded(): boolean {
    return this.txnState.achievedUploads > 0;
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
