import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MediaType,
  MediaUploadStatus,
  UploadTxnStatus,
} from 'src/components/MediaUploader/types';
import UploadProvider, {
  createUploadTxn,
} from 'src/components/MediaUploader/UploadContext';
import {
  describe,
  it as baseIt,
  type Mock,
  vi,
  expect,
  afterEach,
} from 'vitest';

const newUploadMock = vi.fn();
const stopUploadMock = vi.fn();
const completeTxnPartiallyMock = vi.fn();
const removeTransactionMock = vi.fn();
const getFailedTxnMediaFilesMock = vi.fn();
const getTransactionsMock = vi.fn().mockReturnValue([
  {
    txnId: 'txn1',
    status: UploadTxnStatus.InProgress,
    state: {
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
    },
  },
]);

vi.mock('src/controllers/UploadController', () => ({
  default: vi.fn(() => ({
    newUpload: newUploadMock,
    stopUpload: stopUploadMock,
    completeTxnPartially: completeTxnPartiallyMock,
    removeTransaction: removeTransactionMock,
    getFailedTxnMediaFiles: getFailedTxnMediaFilesMock,
    getTransactions: getTransactionsMock,
  })),
}));

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
      .mockReturnValue({ done: true });

    const fileListMock = {
      [Symbol.iterator]: () => ({ next: mockNext }),
      length: 3,
    } as unknown as FileList;

    await use({ mockNext, fileList: fileListMock });
  },
});

describe('UploadContext', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should show upload chicklets', async ({ mockFileList }) => {
    render(
      <div>
        <UploadProvider />
      </div>
    );

    createUploadTxn(mockFileList.fileList);

    expect(
      await screen.findByText('Media getting uploaded')
    ).toBeInTheDocument();
  });

  it('should stop upload', async ({ mockFileList }) => {
    render(
      <div>
        <UploadProvider />
      </div>
    );

    createUploadTxn(mockFileList.fileList);

    expect(
      await screen.findByText('Media getting uploaded')
    ).toBeInTheDocument();

    const buttons = await screen.findAllByRole('button');
    const stopBtn = buttons[0];

    getTransactionsMock.mockReturnValueOnce([
      {
        txnId: 'txn1',
        status: UploadTxnStatus.Retry,
        state: {
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
        },
      },
    ]);

    await userEvent.click(stopBtn);

    expect(stopUploadMock).toHaveBeenCalledExactlyOnceWith('txn1');

    expect(
      await screen.findByText('3 out of 3 uploads remaining')
    ).toBeInTheDocument();
  });

  it('should retry all uploads', async ({ mockFileList }) => {
    render(
      <div>
        <UploadProvider />
      </div>
    );

    getTransactionsMock.mockReturnValueOnce([
      {
        txnId: 'txn1',
        status: UploadTxnStatus.Retry,
        state: {
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
              progress: 20,
            },
          ],
        },
      },
    ]);

    createUploadTxn(mockFileList.fileList);

    const buttons = await screen.findAllByRole('button');
    const retryBtn = buttons[0];

    getFailedTxnMediaFilesMock.mockReturnValueOnce(mockFileList.fileList);

    // required two times as state update happening two times.
    for (let a = 0; a < 2; a++) {
      getTransactionsMock.mockReturnValueOnce([
        {
          txnId: 'txn1',
          status: UploadTxnStatus.InProgress,
          state: {
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
          },
        },
      ]);
    }

    await userEvent.click(retryBtn);

    expect(getFailedTxnMediaFilesMock).toHaveBeenCalledExactlyOnceWith('txn1');
    expect(newUploadMock).toHaveBeenCalledTimes(2);
    expect(completeTxnPartiallyMock).toHaveBeenCalledExactlyOnceWith('txn1');

    expect(
      await screen.findByText('Media getting uploaded')
    ).toBeInTheDocument();
  });
});
