import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MediaType,
  MediaUploadStatus,
  UploadTxnStatus,
} from 'src/components/MediaUploader/types';
import UploadProvider, {
  createUploadTxn,
} from 'src/components/MediaUploader/UploadContext';
import { CancelOrigin } from 'src/components/MediaUploader/UploadTxn/types';
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
const commitTxnMock = vi.fn();
const cancelTxnMock = vi.fn();

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
    commitTransaction: commitTxnMock,
    cancelTransaction: cancelTxnMock,
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

  it('should show complete media dialog', async ({ mockFileList }) => {
    render(
      <div>
        <UploadProvider />
      </div>
    );

    getTransactionsMock.mockReturnValueOnce([
      {
        txnId: 'txn1',
        status: UploadTxnStatus.Success,
        state: {
          targetUploads: 3,
          achievedUploads: 3,
          previews: [
            'txn1-media-1.png',
            'txn1-media-2.png',
            'txn1-media-3.png',
          ],
        },
      },
    ]);

    createUploadTxn(mockFileList.fileList);

    expect(await screen.findByText('Upload completed')).toBeInTheDocument();
  });

  it('should show partially complete media dialog', async ({
    mockFileList,
  }) => {
    render(
      <div>
        <UploadProvider />
      </div>
    );

    getTransactionsMock.mockReturnValueOnce([
      {
        txnId: 'txn1',
        status: UploadTxnStatus.Success,
        state: {
          targetUploads: 3,
          achievedUploads: 2,
          previews: ['txn1-media-1.png', 'txn1-media-2.png'],
        },
      },
    ]);

    createUploadTxn(mockFileList.fileList);

    expect(
      await screen.findByText('Upload completed partially')
    ).toBeInTheDocument();
  });

  it('should complete the uploaded media', async ({ mockFileList }) => {
    render(
      <div>
        <UploadProvider />
      </div>
    );

    getTransactionsMock.mockReturnValueOnce([
      {
        txnId: 'txn1',
        status: UploadTxnStatus.Success,
        state: {
          targetUploads: 3,
          achievedUploads: 3,
          previews: [
            'txn1-media-1.png',
            'txn1-media-2.png',
            'txn1-media-3.png',
          ],
        },
      },
    ]);

    createUploadTxn(mockFileList.fileList);

    const [completeBtn, ..._] = await screen.findAllByRole('button');

    getTransactionsMock.mockReturnValueOnce([]);

    await userEvent.click(completeBtn);

    expect(commitTxnMock).toHaveBeenCalledExactlyOnceWith('txn1');
    expect(screen.queryByText('Upload completed')).not.toBeInTheDocument();
  });

  it('should complete a partially uploaded media', async ({ mockFileList }) => {
    render(
      <div>
        <UploadProvider />
      </div>
    );

    getTransactionsMock.mockReturnValueOnce([
      {
        txnId: 'txn1',
        status: UploadTxnStatus.Success,
        state: {
          targetUploads: 3,
          achievedUploads: 2,
          previews: ['txn1-media-1.png', 'txn1-media-2.png'],
        },
      },
    ]);

    createUploadTxn(mockFileList.fileList);

    const [completeBtn, ..._] = await screen.findAllByRole('button');

    getTransactionsMock.mockReturnValueOnce([]);

    await userEvent.click(completeBtn);

    expect(commitTxnMock).toHaveBeenCalledExactlyOnceWith('txn1');
    expect(
      screen.queryByText('Upload completed partially')
    ).not.toBeInTheDocument();
  });

  it('should cancel a completed upload', async ({ mockFileList }) => {
    render(
      <div>
        <UploadProvider />
      </div>
    );

    getTransactionsMock.mockReturnValueOnce([
      {
        txnId: 'txn1',
        status: UploadTxnStatus.Success,
        state: {
          targetUploads: 3,
          achievedUploads: 3,
          previews: [
            'txn1-media-1.png',
            'txn1-media-2.png',
            'txn1-media-3.png',
          ],
        },
      },
    ]);

    createUploadTxn(mockFileList.fileList);

    await waitFor(() =>
      expect(screen.queryByText('Upload completed')).toBeInTheDocument()
    );

    const [_, cancelBtn] = await screen.findAllByRole('button');

    getTransactionsMock.mockReturnValueOnce([]);

    await userEvent.click(cancelBtn);

    expect(cancelTxnMock).toHaveBeenCalledExactlyOnceWith(
      'txn1',
      CancelOrigin.Completed
    );

    await waitFor(() =>
      expect(screen.queryByText('Upload completed')).not.toBeInTheDocument()
    );
  });

  it('should cancel a partially completed upload', async ({ mockFileList }) => {
    render(
      <div>
        <UploadProvider />
      </div>
    );

    getTransactionsMock.mockReturnValueOnce([
      {
        txnId: 'txn1',
        status: UploadTxnStatus.Success,
        state: {
          targetUploads: 3,
          achievedUploads: 2,
          previews: ['txn1-media-1.png', 'txn1-media-2.png'],
        },
      },
    ]);

    createUploadTxn(mockFileList.fileList);

    await waitFor(() =>
      expect(
        screen.queryByText('Upload completed partially')
      ).toBeInTheDocument()
    );

    const [_, cancelBtn] = await screen.findAllByRole('button');

    getTransactionsMock.mockReturnValueOnce([]);

    await userEvent.click(cancelBtn);

    expect(cancelTxnMock).toHaveBeenCalledExactlyOnceWith(
      'txn1',
      CancelOrigin.Completed
    );

    await waitFor(() =>
      expect(
        screen.queryByText('Upload completed partially')
      ).not.toBeInTheDocument()
    );
  });

  it('should cancel a upload retry with no partial uploads', async ({
    mockFileList,
  }) => {
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

    expect(
      await screen.findByText('3 out of 3 uploads remaining')
    ).toBeInTheDocument();

    const [_, cancelBtn, ...__] = await screen.findAllByRole('button');

    getTransactionsMock.mockReturnValueOnce([]);

    await userEvent.click(cancelBtn);

    expect(cancelTxnMock).toHaveBeenCalledExactlyOnceWith(
      'txn1',
      CancelOrigin.Retry
    );

    await waitFor(() =>
      expect(
        screen.queryByText('3 out of 3 uploads remaining')
      ).not.toBeInTheDocument()
    );
  });

  it('should cancel a upload retry with partial uploads', async ({
    mockFileList,
  }) => {
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
          achievedUploads: 1,
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
              status: MediaUploadStatus.Success,
              id: 'txn1-media-3',
              progress: 20,
            },
          ],
          previews: ['preview'],
        },
      },
    ]);

    createUploadTxn(mockFileList.fileList);

    expect(
      await screen.findByText('2 out of 3 uploads remaining')
    ).toBeInTheDocument();

    const [_, cancelBtn, ...__] = await screen.findAllByRole('button');

    getTransactionsMock.mockReturnValueOnce([
      {
        txnId: 'txn1',
        status: UploadTxnStatus.Success,
        state: {
          targetUploads: 3,
          achievedUploads: 1,
          previews: ['preview'],
        },
      },
    ]);

    await userEvent.click(cancelBtn);

    expect(cancelTxnMock).toHaveBeenCalledExactlyOnceWith(
      'txn1',
      CancelOrigin.Retry
    );

    await waitFor(() =>
      expect(
        screen.queryByText('2 out of 3 uploads remaining')
      ).not.toBeInTheDocument()
    );
    expect(
      await screen.findByText('Upload completed partially')
    ).toBeInTheDocument();
  });

  it('should cancel a partial completed upload in retry', async ({
    mockFileList,
  }) => {
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
          achievedUploads: 1,
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
              status: MediaUploadStatus.Success,
              id: 'txn1-media-3',
              progress: 20,
            },
          ],
          previews: ['preview'],
        },
      },
    ]);

    createUploadTxn(mockFileList.fileList);

    expect(
      await screen.findByText('Upload completed partially')
    ).toBeInTheDocument();

    const [cancelBtn, ..._] = (await screen.findAllByRole('button')).reverse();

    getTransactionsMock.mockReturnValueOnce([
      {
        txnId: 'txn1',
        status: UploadTxnStatus.Retry,
        state: {
          targetUploads: 2,
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
          ],
          previews: [],
        },
      },
    ]);

    await userEvent.click(cancelBtn);

    expect(cancelTxnMock).toHaveBeenCalledExactlyOnceWith(
      'txn1',
      CancelOrigin.RetryCompleted
    );

    await waitFor(() =>
      expect(
        screen.queryByText('Upload completed partially')
      ).not.toBeInTheDocument()
    );
    expect(
      await screen.findByText('2 out of 2 uploads remaining')
    ).toBeInTheDocument();
  });
});
