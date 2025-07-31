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
import UploadTransaction from 'src/models/UploadTransaction';
import { describe, expect, it as baseIt, vi, type Mock } from 'vitest';

const file1 = new File(['Hello world'], 'hello.txt', {
  type: 'text/plain',
});

const file2 = new File(['Hello world'], 'hello2.txt', {
  type: 'text/plain',
});

const file3 = new File(['Hello world'], 'hello3.png', {
  type: 'image/png',
});

const it = baseIt.extend<{
  mockFileList: { fileList: FileList; mockNext: Mock };
}>({
  mockFileList: async ({}, use) => {
    const mockNext = vi
      .fn()
      .mockReturnValueOnce({ value: file1, done: false })
      .mockReturnValueOnce({ value: file2, done: false })
      .mockReturnValueOnce({ value: file3, done: false })
      .mockReturnValue({ value: undefined, done: true });

    const fileListMock = {
      [Symbol.iterator]: () => ({ next: mockNext }),
      mockNext,
    } as unknown as FileList;

    await use({ fileList: fileListMock, mockNext });
  },
});

describe('UploadTransaction', () => {
  it('should instantiate an upload transaction', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    expect(txn.txnId).toBe(txnId);
    expect(mockFileList.mockNext).toBeCalledTimes(4);
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
          file: file1,
          progress: 0,
        },
        {
          name: 'hello2.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.InProgress,
          file: file2,
          progress: 0,
        },
        {
          name: 'hello3.png',
          type: MediaType.Image,
          status: MediaUploadStatus.InProgress,
          file: file3,
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
          file: file1,
          progress: 0,
        },
        {
          name: 'hello2.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.Failed,
          file: file2,
          progress: 0,
        },
        {
          name: 'hello3.png',
          type: MediaType.Image,
          status: MediaUploadStatus.Failed,
          file: file3,
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

    const progresses = [10, 20, 30];
    txn.updateMediaProgresses(progresses);
    const state = txn.state as InProgressStateType;

    const actual = state.mediaItems.map((item) => item.progress);
    expect(actual).toStrictEqual(progresses);
  });

  it('should correctly update media progress if exceeds 100', ({
    mockFileList,
  }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    const progresses = [10, 20, 130];
    txn.updateMediaProgresses(progresses);
    const state = txn.state as InProgressStateType;

    const actual = state.mediaItems.map((item) => item.progress);
    expect(actual).toStrictEqual([10, 20, 100]);
  });

  it('should not update media progress if already 100', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    txn.updateMediaProgresses([10, 20, 100]);

    const state = txn.state as InProgressStateType;
    const actual1 = state.mediaItems.map((item) => item.progress);

    expect(actual1).toStrictEqual([10, 20, 100]);

    txn.updateMediaProgresses([10, 20, 10]);
    const newState = txn.state as InProgressStateType;
    const actual2 = newState.mediaItems.map((item) => item.progress);

    expect(actual2).toStrictEqual([10, 20, 100]);
  });

  it('should increase total uploads if completes 100', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    expect(txn.state.achievedUploads).toStrictEqual(0);

    const progresses = [10, 20, 100];
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

    txn.updateMediaProgresses([10, 20, 100]);

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
          file: file1,
          progress: 0,
        },
        {
          name: 'hello2.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.Failed,
          file: file2,
          progress: 0,
        },
        {
          name: 'hello3.png',
          type: MediaType.Image,
          status: MediaUploadStatus.Failed,
          file: file3,
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

    txn.updateMediaProgresses([100, 100, 100]);

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

    txn.updateMediaProgresses([100, 100, 90]);

    const expected: InProgressStateType = {
      targetUploads: 3,
      achievedUploads: 2,
      mediaItems: [
        {
          name: 'hello.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.Success,
          file: file1,
          progress: 100,
        },
        {
          name: 'hello2.txt',
          type: MediaType.Video,
          status: MediaUploadStatus.Success,
          file: file2,
          progress: 100,
        },
        {
          name: 'hello3.png',
          type: MediaType.Image,
          status: MediaUploadStatus.InProgress,
          file: file3,
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

    txn.updateMediaProgresses([100, 100, 90]);

    expect(txn.complete()).toBe(false);
    expect(txn.status).toBe(UploadTxnStatus.InProgress);
  });

  it('should complete transaction partially', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    txn.updateMediaProgresses([100, 100, 90]);
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

    txn.updateMediaProgresses([100, 100, 90]);

    expect(txn.completePartially()).toBe(false);
    expect(txn.status).toBe(UploadTxnStatus.InProgress);
  });

  it('should return pending media to upload', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    txn.updateMediaProgresses([100, 100, 90]);

    const expectedMedia: MediaItemType = {
      name: 'hello3.png',
      status: MediaUploadStatus.InProgress,
      file: file3,
      progress: 90,
      type: MediaType.Image,
    };
    expect(txn.getPendingMedia()).toStrictEqual([expectedMedia]);
  });

  it('should return transaction object', ({ mockFileList }) => {
    const txnId = 'txn1';
    const txn = new UploadTransaction(txnId, mockFileList.fileList);

    txn.updateMediaProgresses([100, 100, 90]);

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
            file: file1,
            progress: 100,
          },
          {
            name: 'hello2.txt',
            type: MediaType.Video,
            status: MediaUploadStatus.Success,
            file: file2,
            progress: 100,
          },
          {
            name: 'hello3.png',
            type: MediaType.Image,
            status: MediaUploadStatus.InProgress,
            file: file3,
            progress: 90,
          },
        ],
      },
    };
    expect(txn.getObject()).toStrictEqual(expected);
  });
});
