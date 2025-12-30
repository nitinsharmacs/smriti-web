import type { ProgressStats } from 'src/models/UploadTransaction';
import type { FileItem } from './types';

export default class FileUploader {
  private txnId: string;

  private req_map: { [key: string]: XMLHttpRequest } = {};

  private _progresses: ProgressStats = {};

  constructor(txnId: string) {
    this.txnId = txnId;
  }

  start(url: string, files: FileItem[]) {
    files.forEach((file) => {
      this._progresses[file.id] = 0; // set progress

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

      req.open('POST', url);

      req.send(formData);

      this.req_map[file.id] = req;
    });
  }

  stop() {
    Object.values(this.req_map).forEach((req) => req.abort());
  }

  finished(): boolean {
    return Object.values(this.progresses).every((progress) => progress >= 100);
  }

  get progresses() {
    return this._progresses;
  }
}
