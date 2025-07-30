const deltas = (count: number) => {
  const items = [];
  let del = 10;
  for (let start = 0; start < count; start++) {
    items.push(del);
    del += 20;
  }
  return items;
};

class UploadService {
  private interval: number | undefined;
  private timeout: number | undefined;

  private txnIds = ['txn1', 'txn2', 'txn3'];
  private usingIndex: number = 0;

  constructor() {}

  uploadFiles(
    txnId: string,
    files: FileList,
    onProgress: (progresses: number[]) => void,
    onComplete: () => void
  ): () => void {
    // upload and return some progressor

    let progresses = new Array(files.length).fill(0);

    const steps = deltas(files.length);

    this.interval = setInterval(() => {
      progresses = progresses.map((p, i) => {
        const progress = p + steps[i];
        if (progress > 100) return 100;
        return progress;
      });
      onProgress(progresses);
    }, 1500);

    setTimeout(() => {
      clearInterval(this.interval);

      onComplete();
    }, 15000);

    return () => {
      clearInterval(this.interval);
      clearTimeout(this.timeout);
    };
  }

  createTransaction(): string {
    return this.txnIds[this.usingIndex++];
  }
}

export default UploadService;
