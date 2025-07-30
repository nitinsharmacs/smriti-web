import {
  MediaType,
  MediaUploadStatus,
  type InProgressStateType,
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
});
