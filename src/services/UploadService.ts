import type { Transaction } from 'src/dao/Upload';
import type { ProgressStats } from 'src/models/UploadTransaction';
import FileUploader from './FileUploader';
import type { FileItem } from './types';

class UploadService {
  private interval: number | undefined;
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  uploadFiles(
    txnId: string,
    files: FileItem[],
    onProgress: (progresses: ProgressStats) => void,
    onComplete: () => void
  ): () => void {
    const upload = new FileUploader(txnId);

    upload.start(this.baseUrl + '/upload/upload', files);

    this.interval = setInterval(() => {
      onProgress(upload.progresses);

      if (upload.finished()) {
        onComplete();
        return clearInterval(this.interval);
      }
    }, 100);

    return () => {
      clearInterval(this.interval);
      upload.stop();
    };
  }

  async createTransaction(mediaCount: number): Promise<Transaction> {
    return fetch(this.baseUrl + '/upload/create-txn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mediaCount }),
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error('txn creation failed');
        }
        return res.json();
      })
      .then((res) => {
        return {
          txnId: res.txnId,
          mediaIds: res.mediaIds,
        };
      });
  }

  async commitTransaction(txnId: string): Promise<void> {
    await fetch(this.baseUrl + '/upload/commit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txn_id: txnId }),
    });
  }

  async deleteTransaction(txnId: string): Promise<void> {
    await fetch(this.baseUrl + '/upload/delete-txn', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txn_id: txnId }),
    });
  }
}

export default UploadService;
