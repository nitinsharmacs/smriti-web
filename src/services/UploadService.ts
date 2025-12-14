import { BASE_URL } from 'src/constants';
import type { Transaction } from 'src/dao/Upload';
import type { ProgressStats } from 'src/models/UploadTransaction';

export type FileItem = {
  id: string;
  file: File;
};

export class FileUploader {
  private txnId: string;
  private files: FileItem[];
  private req_map: { [key: string]: XMLHttpRequest } = {};

  private _progresses: ProgressStats = {};

  constructor(txnId: string, files: FileItem[]) {
    this.txnId = txnId;
    this.files = files;
  }

  start() {
    this.files.forEach((file) => {
      const req = new XMLHttpRequest();

      const formData = new FormData();
      formData.append('txnId', this.txnId);
      formData.append('mediaId', file.id);
      formData.append('file', file.file);

      req.upload.addEventListener('progress', (event: ProgressEvent) => {
        this._progresses[file.id] = Math.floor(
          (event.loaded / event.total) * 100
        );
      });

      req.upload.addEventListener('abort', () => {
        console.log('Aborted upload for file ', file.file.name);
      });

      req.open('POST', BASE_URL + '/upload');

      req.send(formData);

      this.req_map[file.id] = req;
    });
  }

  stop() {
    Object.values(this.req_map).forEach((req) => req.abort());
  }

  finished(): boolean {
    return Object.values(this._progresses).every((progress) => progress >= 100);
  }

  get progresses() {
    return this._progresses;
  }
}

class UploadService {
  private interval: number | undefined;

  constructor() {}

  uploadFiles(
    txnId: string,
    files: FileItem[],
    onProgress: (progresses: ProgressStats) => void,
    onComplete: () => void
  ): () => void {
    const upload = new FileUploader(txnId, files);
    upload.start();

    this.interval = setInterval(() => {
      if (upload.finished()) {
        onProgress(upload.progresses);
        onComplete();
        return clearInterval(this.interval);
      }

      onProgress(upload.progresses);
    }, 100);

    return () => {
      clearInterval(this.interval);
      upload.stop();
    };
  }

  async createTransaction(mediaCount: number): Promise<Transaction> {
    return fetch(BASE_URL + '/create-upload-txn', {
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
}

export default UploadService;
