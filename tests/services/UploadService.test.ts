import type { Transaction } from 'src/dao/Upload';
import UploadService from 'src/services/UploadService';
import {
  describe,
  expect,
  it as baseIt,
  vi,
  type Mock,
  afterEach,
  beforeEach,
} from 'vitest';

const it = baseIt.extend<{
  fetchMock: Mock;
  setIntervalMock: Mock;
  clearIntervalMock: Mock;
}>({
  fetchMock: async ({}, use: (fetchMock: Mock) => Promise<void>) => {
    const fetchMock: Mock = vi.fn();

    vi.stubGlobal('fetch', fetchMock);

    await use(fetchMock);

    vi.unstubAllGlobals();
  },
  setIntervalMock: async (
    {},
    use: (setIntervalMock: Mock) => Promise<void>
  ) => {
    const setIntervalMock = vi.fn();
    vi.stubGlobal('setInterval', setIntervalMock);

    await use(setIntervalMock);
    vi.unstubAllGlobals();
  },
  clearIntervalMock: async (
    {},
    use: (clearIntervalMock: Mock) => Promise<void>
  ) => {
    const clearIntervalMock = vi.fn();
    vi.stubGlobal('clearInterval', clearIntervalMock);

    await use(clearIntervalMock);

    vi.unstubAllGlobals();
  },
});

const fileUploaderStartMock = vi.fn();
const fileUploaderStopMock = vi.fn();
const fileUploaderFinishedMock = vi.fn();
const fileUploaderProgressMock = vi.fn();

vi.mock('src/services/FileUploader', () => {
  return {
    default: vi.fn(() => {
      return {
        start: fileUploaderStartMock,
        stop: fileUploaderStopMock,
        finished: fileUploaderFinishedMock,
        get progresses() {
          return fileUploaderProgressMock();
        },
      };
    }),
  };
});

import FileUploader from 'src/services/FileUploader';

describe('UploadService', () => {
  beforeEach(() => {
    fileUploaderProgressMock
      .mockReturnValueOnce({ media1: 20 })
      .mockReturnValueOnce({ media1: 100 });

    fileUploaderFinishedMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create an upload transaction', async ({ fetchMock }) => {
      fetchMock.mockImplementation(() => {
        return Promise.resolve({
          status: 200,
          json: () => ({
            txnId: 'txn_id',
            mediaIds: ['media1', 'media2'],
          }),
        });
      });

      const service = new UploadService('url');

      const expectedTxn: Transaction = {
        txnId: 'txn_id',
        mediaIds: ['media1', 'media2'],
      };

      const actualTxn = await service.createTransaction(2);

      expect(actualTxn).toStrictEqual(expectedTxn);
      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
        'url/upload/create-txn',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mediaCount: 2 }),
        }
      );
    });
  });
  describe('uploadFiles', () => {
    it('should start upload in interval', ({
      setIntervalMock,
      clearIntervalMock,
    }) => {
      let cb = () => {};

      setIntervalMock.mockImplementationOnce((fn) => {
        cb = fn;
        return 'intervalid';
      });

      const service = new UploadService('/url');
      const files = [{ file: new File(['test'], 'file.txt'), id: 'media1' }];
      const onProgressMock = vi.fn();
      const onCompleteMock = vi.fn();

      const stopper = service.uploadFiles(
        'txn_id',
        files,
        onProgressMock,
        onCompleteMock
      );

      expect(FileUploader).toHaveBeenCalledExactlyOnceWith('txn_id', files);

      expect(fileUploaderStartMock).toHaveBeenCalledExactlyOnceWith(
        '/url' + '/upload/upload'
      );

      cb(); // call interval cb
      cb(); // call second time for completion

      expect(onProgressMock.mock.calls).toEqual([
        [{ media1: 20 }],
        [{ media1: 100 }],
      ]);

      expect(fileUploaderFinishedMock).toHaveBeenCalledTimes(2);
      expect(onCompleteMock).toHaveBeenCalledOnce();
      expect(setIntervalMock).toHaveBeenCalledExactlyOnceWith(
        expect.any(Function),
        100
      );
      expect(clearIntervalMock).toHaveBeenCalledExactlyOnceWith('intervalid');

      stopper();

      expect(fileUploaderStopMock).toHaveBeenCalledOnce();
      expect(clearIntervalMock).toHaveBeenCalledTimes(2);
    });
  });
});
