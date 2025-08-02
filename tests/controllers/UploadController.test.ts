import UploadController from 'src/controllers/UploadController';
import {
  describe,
  it as baseIt,
  vi,
  type Mock,
  expect,
  afterEach,
} from 'vitest';

const transactionStopMock = vi.fn();
vi.mock('src/models/UploadTransaction', () => {
  return {
    default: vi.fn(() => {
      return {
        stop: transactionStopMock,
      };
    }),
  };
});

import UploadTransaction from 'src/models/UploadTransaction';

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
  getController: { controller: UploadController; serviceMock: Mock };
  mockFileList: { fileList: FileList; mockNext: Mock };
}>({
  getController: async ({}, use) => {
    const serviceMock = vi.fn();
    serviceMock.prototype.createTransaction = vi.fn();

    serviceMock.prototype.getTxnMediaIds = vi.fn();
    serviceMock.prototype.uploadFiles = vi.fn();

    const controller = new UploadController(new serviceMock());
    await use({ controller, serviceMock });
  },
  mockFileList: async ({}, use) => {
    const mockNext = vi
      .fn()
      .mockReturnValueOnce({ value: file1, done: false })
      .mockReturnValueOnce({ value: file2, done: false })
      .mockReturnValueOnce({ value: file3, done: false })
      .mockReturnValue({ done: true });

    const fileListMock = {
      [Symbol.iterator]: () => ({ next: mockNext }),
    } as unknown as FileList;

    await use({ mockNext, fileList: fileListMock });
  },
});

describe('UploadController', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should upload files', ({ getController, mockFileList }) => {
    const controller = getController.controller;

    const serviceMock = getController.serviceMock;

    serviceMock.prototype.createTransaction.mockReturnValue('txn1');
    serviceMock.prototype.getTxnMediaIds.mockReturnValue([1, 2, 3]);

    const result = controller.newUpload(mockFileList.fileList);

    expect(result).toBe('txn1');

    expect(mockFileList.mockNext).toBeCalledTimes(4);

    expect(UploadTransaction).toHaveBeenCalledExactlyOnceWith('txn1', [
      { type: 'text/plain', name: 'hello.txt', id: 1 },
      { type: 'text/plain', name: 'hello2.txt', id: 2 },
      { type: 'image/png', name: 'hello3.png', id: 3 },
    ]);

    expect(serviceMock.prototype.createTransaction).toHaveBeenCalledOnce();

    expect(
      serviceMock.prototype.getTxnMediaIds
    ).toHaveBeenCalledExactlyOnceWith('txn1');

    expect(serviceMock.prototype.uploadFiles).toHaveBeenCalledExactlyOnceWith(
      'txn1',
      mockFileList.fileList,
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('should stop an upload', ({ getController, mockFileList }) => {
    const controller = getController.controller;
    const serviceMock = getController.serviceMock;

    serviceMock.prototype.createTransaction.mockReturnValue('txn1');
    serviceMock.prototype.getTxnMediaIds.mockReturnValue([1, 2, 3]);

    const stopperMock = vi.fn();
    serviceMock.prototype.uploadFiles.mockReturnValue(stopperMock);
    controller.newUpload(mockFileList.fileList);

    expect(controller.stopUpload('txn1')).toBe(true);

    expect(stopperMock).toHaveBeenCalledOnce();

    expect(transactionStopMock).toHaveBeenCalledOnce();
  });

  it('should stop non existing upload', ({ getController }) => {
    const controller = getController.controller;

    expect(controller.stopUpload('txn1')).toBe(false);
  });
});
