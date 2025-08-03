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
const anyFileUploadedMock = vi.fn();
const completePartiallyMock = vi.fn();
const getFailedMediaIdsMock = vi.fn();
const getObjectMock = vi.fn();
const updateMediaProgressesMock = vi.fn();
const completeMock = vi.fn();

vi.mock('src/models/UploadTransaction', () => {
  return {
    default: vi.fn(() => {
      return {
        stop: transactionStopMock,
        anyFileUploaded: anyFileUploadedMock,
        completePartially: completePartiallyMock,
        getFailedMediaIds: getFailedMediaIdsMock,
        getObject: getObjectMock,
        complete: completeMock,
        updateMediaProgresses: updateMediaProgressesMock,
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

    serviceMock.prototype.createTransaction.mockReturnValue('txn1');
    serviceMock.prototype.getTxnMediaIds.mockReturnValue([1, 2, 3]);

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

  it('should call progress handler in new upload', ({
    getController,
    mockFileList,
  }) => {
    const controller = getController.controller;

    const serviceMock = getController.serviceMock;
    serviceMock.prototype.uploadFiles.mockImplementation(
      (_: any, __: any, progresscb: any, ___: any) => {
        progresscb([1, 2, 3]);
      }
    );

    const onProgressMock = vi.fn();

    controller.newUpload(mockFileList.fileList, onProgressMock);

    expect(updateMediaProgressesMock).toHaveBeenCalledExactlyOnceWith([
      1, 2, 3,
    ]);
    expect(onProgressMock).toHaveBeenCalledOnce();
  });

  it('should call complete handler in new upload', ({
    getController,
    mockFileList,
  }) => {
    const controller = getController.controller;

    const serviceMock = getController.serviceMock;
    serviceMock.prototype.uploadFiles.mockImplementation(
      (_: any, __: any, ___: any, completecb: any) => {
        completecb();
      }
    );

    const onCompleteMock = vi.fn();

    controller.newUpload(mockFileList.fileList, vi.fn(), onCompleteMock);

    expect(completeMock).toHaveBeenCalledOnce();
    expect(onCompleteMock).toHaveBeenCalledOnce();
  });

  it('should stop an upload', ({ getController, mockFileList }) => {
    const controller = getController.controller;
    const serviceMock = getController.serviceMock;

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

  it('should complete a transaction partially', ({
    getController,
    mockFileList,
  }) => {
    const controller = getController.controller;

    controller.newUpload(mockFileList.fileList);

    anyFileUploadedMock.mockReturnValue(true);

    expect(controller.completeTxnPartially('txn1')).toBe(true);
    expect(completePartiallyMock).toHaveBeenCalledOnce();
  });

  it('should delete the transaction on partial completion of media uploads', ({
    getController,
    mockFileList,
  }) => {
    const controller = getController.controller;

    controller.newUpload(mockFileList.fileList);

    anyFileUploadedMock.mockReturnValue(false);

    const removeTransactionMock = vi.spyOn(controller, 'removeTransaction');
    expect(controller.completeTxnPartially('txn1')).toBe(false);
    expect(completePartiallyMock).toBeCalledTimes(0);
    expect(removeTransactionMock).toBeCalledTimes(1);
  });

  it('should do nothing if txn entry missing for partial complete', ({
    getController,
    mockFileList,
  }) => {
    const controller = getController.controller;

    controller.newUpload(mockFileList.fileList);

    expect(controller.completeTxnPartially('txn1')).toBe(false);
    expect(completePartiallyMock).toBeCalledTimes(0);
  });

  it('should remove transaction', ({ getController, mockFileList }) => {
    const controller = getController.controller;

    controller.newUpload(mockFileList.fileList);

    expect(controller.removeTransaction('txn1')).toBe(true);
    expect(controller.hasTransaction('txn1')).toBe(false);
  });

  it('should get failed txn media files', ({ getController, mockFileList }) => {
    const itemsAddMock = vi.fn();
    const DataTransferMock = vi.fn().mockImplementation(() => {
      return {
        items: {
          add: itemsAddMock,
        },
        files: [file2, file3],
      };
    });

    vi.stubGlobal('DataTransfer', DataTransferMock);

    const controller = getController.controller;

    controller.newUpload(mockFileList.fileList);

    getFailedMediaIdsMock.mockReturnValue([2, 3]);

    expect(controller.getFailedTxnMediaFiles('txn1')).toStrictEqual([
      file2,
      file3,
    ]);
  });

  it('should non exiting txn return empty failed media file', ({
    getController,
  }) => {
    const DataTransferMock = vi.fn().mockImplementation(() => {
      return {
        files: [],
      };
    });

    vi.stubGlobal('DataTransfer', DataTransferMock);

    const controller = getController.controller;

    expect(controller.getFailedTxnMediaFiles('txn1')).toStrictEqual([]);
    expect(getFailedMediaIdsMock).toBeCalledTimes(0);
  });

  it('should get transaction objects', ({ getController, mockFileList }) => {
    const controller = getController.controller;

    controller.newUpload(mockFileList.fileList);

    const expected = ['transaction'];

    getObjectMock.mockReturnValue('transaction');

    expect(controller.getTransactions()).toStrictEqual(expected);
    expect(getObjectMock).toHaveBeenCalledOnce();
  });
});
