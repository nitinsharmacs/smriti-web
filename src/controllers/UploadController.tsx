import { type UploadTxnType } from 'src/components/MediaUploader/types';
import { doNothing } from 'src/helpers';
import UploadTransaction, { type FileType } from 'src/models/UploadTransaction';
import UploadService from 'src/services/UploadService';

type FileEntries = {
  [key: string]: File;
};

type TransactionEntries = {
  [key: string]: {
    transaction: UploadTransaction;
    files: FileEntries;
    stopper: () => void;
  };
};

class UploadController {
  private service: UploadService;

  private txnEntries: TransactionEntries;
  constructor() {
    this.txnEntries = {};
    this.service = new UploadService();
  }

  newUpload(
    files: FileList,
    onProgress: () => void = doNothing,
    onComplete: () => void = doNothing
  ): string {
    const txnId = this.service.createTransaction();
    const mediaIds = this.service.getTxnMediaIds(txnId);

    const txnFiles: FileEntries = {};
    const mediaFiles: FileType[] = [];

    [...files].forEach((file, index) => {
      mediaFiles.push({
        id: mediaIds[index],
        name: file.name,
        type: file.type,
      });

      txnFiles[mediaIds[index]] = file;
    });

    const txn = new UploadTransaction(txnId, mediaFiles);

    const stopper = this.service.uploadFiles(
      txnId,
      files,
      (progresses) => {
        txn.updateMediaProgresses(progresses);
        onProgress();
      },
      () => {
        txn.complete();
        onComplete();
      }
    );

    this.txnEntries[txnId] = {
      transaction: txn,
      files: txnFiles,
      stopper,
    };

    return txnId;
  }

  stopUpload(txnId: string): void {
    this.txnEntries[txnId].transaction.stop();
    this.txnEntries[txnId].stopper();
  }

  completeTxnPartially(txnId: string): void {
    const txn = this.txnEntries[txnId].transaction;

    if (!txn.anyFileUploaded()) {
      this.removeTransaction(txnId);
      return;
    }

    txn.completePartially();
  }

  removeTransaction(txnId: string): boolean {
    return delete this.txnEntries[txnId];
  }

  getFailedTxnMediaFiles(txnId: string): FileList {
    const txnEntry = this.txnEntries[txnId];

    const failedMediaIds: string[] = txnEntry.transaction.getFailedMediaIds();

    const dataTransfer = new DataTransfer();
    failedMediaIds.forEach((id) => dataTransfer.items.add(txnEntry.files[id]));

    return dataTransfer.files;
  }

  getTransactions(): UploadTxnType[] {
    return Object.values(this.txnEntries).map((entry) =>
      entry.transaction.getObject()
    );
  }
}

export default UploadController;
