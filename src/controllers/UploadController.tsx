import { type UploadTxnType } from 'src/components/MediaUploader/types';
import { doNothing } from 'src/helpers';
import UploadTransaction from 'src/models/UploadTransaction';
import UploadService from 'src/services/UploadService';

export type TransactionEntries = {
  [key: string]: {
    transaction: UploadTransaction;
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

    const txn = new UploadTransaction(txnId, files);

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
    return this.txnEntries[txnId].transaction.getFailedMediaFiles();
  }

  getTxnObject(txnId: string): UploadTxnType | undefined {
    return this.txnEntries[txnId].transaction.getObject();
  }

  getTransactions(): UploadTxnType[] {
    return Object.values(this.txnEntries).map((entry) =>
      entry.transaction.getObject()
    );
  }
}

export default UploadController;
