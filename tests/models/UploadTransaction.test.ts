import {
  MediaType,
  MediaUploadStatus,
  UploadTxnStatus,
  type CompletedStateType,
  type InProgressStateType,
  type RetryStateType,
  type UploadTxnType,
} from 'src/components/MediaUploader/types';
import UploadTransaction, { type FileType } from 'src/models/UploadTransaction';
import { describe, expect, it as baseIt, vi, type Mock } from 'vitest';

const file1 = {
  type: 'text/plain',
  name: 'hello.txt',
  id: 'txn1-media-1',
};

const file2 = {
  type: 'text/plain',
  name: 'hello2.txt',
  id: 'txn1-media-2',
};

const file3 = {
  type: 'image/png',
  name: 'hello3.png',
  id: 'txn1-media-3',
};

const it = baseIt.extend<{
  mockFileList: { fileList: FileType[]; mockNext: Mock };
}>({
  mockFileList: async ({}, use) => {
    const mockNext = vi
      .fn()
      .mockReturnValueOnce(file1)
      .mockReturnValueOnce(file2)
      .mockReturnValue(file3);

    const files = [file1, file2, file2];

    const fileTypeListMock = {
      map: (cb: (arg0: any) => any) => {
        return files.map(() => cb(mockNext()));
      },
      mockNext,
    } as unknown as FileType[];

    await use({ fileList: fileTypeListMock, mockNext });
  },
});

describe('UploadTransaction', () => {
  it('should instantiate an upload transaction', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    expect(txn.txnId).toBe(txnId);
    expect(mockFileList.mockNext).toBeCalledTimes(3);
  });

  it('should create initial progress state', ({ mockFileList }) => {
    const state = UploadTransaction.createProgressState(mockFileList.fileList);

    const expected: InProgressStateType = {
      targetUploads: 3,
      achievedUploads: 0,
      mediaItems: [
        {
          name: 'hello.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.InProgress,
          id: 'txn1-media-1',
          progress: 0,
        },
        {
          name: 'hello2.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.InProgress,
          id: 'txn1-media-2',
          progress: 0,
        },
        {
          name: 'hello3.png',
          type: MediaType.Image,
          status: MediaUploadStatus.InProgress,
          id: 'txn1-media-3',
          progress: 0,
        },
      ],
    };

    expect(state).toStrictEqual(expected);
  });

  it('should create complete state', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    const expected: CompletedStateType = {
      targetUploads: 3,
      achievedUploads: 3,
      previews: [
        'https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k',
      ],
    };

    const actual = txn.createCompleteState();

    expect(actual).toStrictEqual(expected);
  });

  it('should create retry state', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    const expected: RetryStateType = {
      targetUploads: 3,
      achievedUploads: 0,
      mediaItems: [
        {
          name: 'hello.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.Failed,
          id: 'txn1-media-1',
          progress: 0,
        },
        {
          name: 'hello2.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.Failed,
          id: 'txn1-media-2',
          progress: 0,
        },
        {
          name: 'hello3.png',
          type: MediaType.Image,
          status: MediaUploadStatus.Failed,
          id: 'txn1-media-3',
          progress: 0,
        },
      ],
      previews: [
        'https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k',
      ],
    };

    const actual = txn.createRetryState();

    expect(actual).toStrictEqual(expected);
  });

  it('should update media progress', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    const progresses = {
      'txn1-media-1': 10,
      'txn1-media-2': 20,
      'txn1-media-3': 30,
    };
    txn.updateMediaProgresses(progresses);
    const state = txn.state as InProgressStateType;

    const actual = state.mediaItems.map((item) => item.progress);
    expect(actual).toStrictEqual([10, 20, 30]);
  });

  it('should correctly update media progress if exceeds 100', ({
    mockFileList,
  }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    const progresses = {
      'txn1-media-1': 10,
      'txn1-media-2': 20,
      'txn1-media-3': 130,
    };
    txn.updateMediaProgresses(progresses);
    const state = txn.state as InProgressStateType;

    const actual = state.mediaItems.map((item) => item.progress);
    expect(actual).toStrictEqual([10, 20, 100]);
  });

  it('should not update media progress if already 100', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    txn.updateMediaProgresses({
      'txn1-media-1': 10,
      'txn1-media-2': 20,
      'txn1-media-3': 100,
    });

    const state = txn.state as InProgressStateType;
    const actual1 = state.mediaItems.map((item) => item.progress);

    expect(actual1).toStrictEqual([10, 20, 100]);

    txn.updateMediaProgresses({
      'txn1-media-1': 10,
      'txn1-media-2': 20,
      'txn1-media-3': 10,
    });
    const newState = txn.state as InProgressStateType;
    const actual2 = newState.mediaItems.map((item) => item.progress);

    expect(actual2).toStrictEqual([10, 20, 100]);
  });

  it('should increase total uploads if completes 100', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    expect(txn.state.achievedUploads).toStrictEqual(0);

    const progresses = {
      'txn1-media-1': 10,
      'txn1-media-2': 20,
      'txn1-media-3': 100,
    };
    txn.updateMediaProgresses(progresses);

    expect(txn.state.achievedUploads).toStrictEqual(1);
  });

  it('should media status change to succuess if completes 100', ({
    mockFileList,
  }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    const state = txn.state as InProgressStateType;

    expect(state.mediaItems[2].status).toStrictEqual(
      MediaUploadStatus.InProgress
    );

    txn.updateMediaProgresses({
      'txn1-media-1': 10,
      'txn1-media-2': 20,
      'txn1-media-3': 100,
    });

    const newState = txn.state as InProgressStateType;
    expect(newState.mediaItems[2].status).toStrictEqual(
      MediaUploadStatus.Success
    );
  });

  it('should stop the transaction', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    expect(txn.stop()).toBe(true);

    const retryState: RetryStateType = {
      targetUploads: 3,
      achievedUploads: 0,
      mediaItems: [
        {
          name: 'hello.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.Failed,
          id: 'txn1-media-1',
          progress: 0,
        },
        {
          name: 'hello2.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.Failed,
          id: 'txn1-media-2',
          progress: 0,
        },
        {
          name: 'hello3.png',
          type: MediaType.Image,
          status: MediaUploadStatus.Failed,
          id: 'txn1-media-3',
          progress: 0,
        },
      ],
      previews: [
        'https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k',
      ],
    };
    expect(txn.state).toStrictEqual(retryState);
    expect(txn.status).toBe(UploadTxnStatus.Retry);
  });

  it('should stop do nothing for stopped transaction', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    txn.stop();

    expect(txn.stop()).toBe(false);
  });

  it('should complete the transaction', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    txn.updateMediaProgresses({
      'txn1-media-1': 100,
      'txn1-media-2': 100,
      'txn1-media-3': 100,
    });

    const completedState: CompletedStateType = {
      achievedUploads: 3,
      targetUploads: 3,
      previews: [
        'https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k',
      ],
    };

    expect(txn.complete()).toBe(true);
    expect(txn.state).toStrictEqual(completedState);
    expect(txn.status).toBe(UploadTxnStatus.Success);
  });

  it('should not complete upload if any media pending', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    txn.updateMediaProgresses({
      'txn1-media-1': 100,
      'txn1-media-2': 100,
      'txn1-media-3': 90,
    });

    const expected: InProgressStateType = {
      targetUploads: 3,
      achievedUploads: 2,
      mediaItems: [
        {
          name: 'hello.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.Success,
          id: 'txn1-media-1',
          progress: 100,
        },
        {
          name: 'hello2.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.Success,
          id: 'txn1-media-2',
          progress: 100,
        },
        {
          name: 'hello3.png',
          type: MediaType.Image,
          status: MediaUploadStatus.InProgress,
          id: 'txn1-media-3',
          progress: 90,
        },
      ],
    };

    expect(txn.complete()).toBe(false);
    expect(txn.state).toStrictEqual(expected);
    expect(txn.status).toBe(UploadTxnStatus.InProgress);
  });

  it('should not complete if not in progress', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    txn.stop();

    expect(txn.complete()).toBe(false);
  });

  it('should complete transaction partially', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    txn.updateMediaProgresses({
      'txn1-media-1': 100,
      'txn1-media-2': 100,
      'txn1-media-3': 90,
    });
    txn.stop(); // putting in retry state

    const expected: CompletedStateType = {
      targetUploads: 3,
      achievedUploads: 2,
      previews: [
        'https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k',
      ],
    };

    expect(txn.completePartially()).toBe(true);
    expect(txn.state).toStrictEqual(expected);
    expect(txn.status).toBe(UploadTxnStatus.Success);
  });

  it('should not partially complete if not in stopped', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    txn.updateMediaProgresses({
      'txn1-media-1': 100,
      'txn1-media-2': 100,
      'txn1-media-3': 90,
    });

    expect(txn.completePartially()).toBe(false);
    expect(txn.status).toBe(UploadTxnStatus.InProgress);
  });

  it('should return transaction object', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    txn.updateMediaProgresses({
      'txn1-media-1': 100,
      'txn1-media-2': 100,
      'txn1-media-3': 90,
    });

    const expected: UploadTxnType = {
      txnId: 'txn1',
      status: UploadTxnStatus.InProgress,
      state: {
        targetUploads: 3,
        achievedUploads: 2,
        mediaItems: [
          {
            name: 'hello.txt',
            type: MediaType.Video,
            status: MediaUploadStatus.Success,
            id: 'txn1-media-1',
            progress: 100,
          },
          {
            name: 'hello2.txt',
            type: MediaType.Video,
            status: MediaUploadStatus.Success,
            id: 'txn1-media-2',
            progress: 100,
          },
          {
            name: 'hello3.png',
            type: MediaType.Image,
            status: MediaUploadStatus.InProgress,
            id: 'txn1-media-3',
            progress: 90,
          },
        ],
      },
    };
    expect(txn.getObject()).toStrictEqual(expected);
  });

  it('should get failed media Ids', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    const progresses = {
      'txn1-media-1': 10,
      'txn1-media-2': 100,
      'txn1-media-3': 30,
    };
    txn.updateMediaProgresses(progresses);
    txn.stop();

    expect(txn.getFailedMediaIds()).toStrictEqual([
      'txn1-media-1',
      'txn1-media-3',
    ]);
  });

  it('should get empty failed media Ids if in progress', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    const progresses = {
      'txn1-media-1': 10,
      'txn1-media-2': 100,
      'txn1-media-3': 30,
    };
    txn.updateMediaProgresses(progresses);

    expect(txn.getFailedMediaIds()).toStrictEqual([]);
  });

  describe('anyFileUploaded', () => {
    it('should check if transaction has any file uploaded', ({
      mockFileList,
    }) => {
      const txnId = 'txn1';
      const txn = new UploadTransaction(txnId, mockFileList.fileList);

      expect(txn.anyFileUploaded()).toBe(false);

      const progresses = {
        'txn1-media-1': 100,
        'txn1-media-2': 0,
        'txn1-media-3': 0,
      };

      txn.updateMediaProgresses(progresses);

      expect(txn.anyFileUploaded()).toBe(true);
    });
  });
  describe('isCompleted', () => {
    it('should check if transaction is completed', ({ mockFileList }) => {
      const txnId = 'txn1';
      const txn = new UploadTransaction(txnId, mockFileList.fileList);

      expect(txn.isCompleted()).toBe(false);

      const progresses = {
        'txn1-media-1': 100,
        'txn1-media-2': 100,
        'txn1-media-3': 100,
      };

      txn.updateMediaProgresses(progresses);
      txn.complete();

      expect(txn.isCompleted()).toBe(true);
    });
  });

  describe('isPartiallyCompleted', () => {
    it('should check if transaction partially completed', ({
      mockFileList,
    }) => {
      const txnId = 'txn1';
      const txn = new UploadTransaction(txnId, mockFileList.fileList);

      expect(txn.isPartiallyCompleted()).toBe(false);

      const progresses = {
        'txn1-media-1': 100,
        'txn1-media-2': 100,
        'txn1-media-3': 50,
      };

      txn.updateMediaProgresses(progresses);
      txn.stop();

      expect(txn.isPartiallyCompleted()).toBe(true);
    });
  });

  describe('retry', () => {
    it('should set transaction state to pure retry state', ({
      mockFileList,
    }) => {
      const txnId = 'txn1';
      const txn = new UploadTransaction(txnId, mockFileList.fileList);

      const retryState: RetryStateType = {
        targetUploads: 1,
        achievedUploads: 0,
        mediaItems: [
          {
            name: 'hello3.png',
            type: MediaType.Image,
            status: MediaUploadStatus.Failed,
            id: 'txn1-media-3',
            progress: 50,
          },
        ],
        previews: [],
      };

      const progresses = {
        'txn1-media-1': 100,
        'txn1-media-2': 100,
        'txn1-media-3': 50,
      };

      txn.updateMediaProgresses(progresses);
      txn.stop();

      expect(txn.retry()).toBe(true);
      expect(txn.state).toStrictEqual(retryState);
      expect(txn.status).toBe(UploadTxnStatus.Retry);
    });

    it('should do nothing if transaction not in Retry state', ({
      mockFileList,
    }) => {
      const txnId = 'txn1';
      const txn = new UploadTransaction(txnId, mockFileList.fileList);

      expect(txn.retry()).toBe(false);
    });
  });
});
