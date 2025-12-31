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
const isCompletedMock = vi.fn();

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
        isCompleted: isCompletedMock,
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
  getController: {
    controller: UploadController;
    serviceMock: Mock;
  };
  mockFileList: { fileList: FileList; mockNext: Mock };
}>({
  getController: async ({}, use) => {
    const serviceMock = vi.fn();
    serviceMock.prototype.createTransaction = vi.fn();
    serviceMock.prototype.uploadFiles = vi.fn();
    serviceMock.prototype.commitTransaction = vi.fn();

    serviceMock.prototype.createTransaction.mockReturnValue({
      txnId: 'txn1',
      mediaIds: ['media1', 'media2', 'media3'],
    });

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
      length: 3,
    } as unknown as FileList;

    await use({ mockNext, fileList: fileListMock });
  },
});

describe('UploadController', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('newUpload', () => {
    it('should upload files', async ({ getController, mockFileList }) => {
      const controller = getController.controller;

      const serviceMock = getController.serviceMock;

      const result = await controller.newUpload(mockFileList.fileList);

      expect(result).toBe('txn1');

      expect(mockFileList.mockNext).toBeCalledTimes(4);

      expect(UploadTransaction).toHaveBeenCalledExactlyOnceWith('txn1', [
        { type: 'text/plain', name: 'hello.txt', id: 'media1' },
        { type: 'text/plain', name: 'hello2.txt', id: 'media2' },
        { type: 'image/png', name: 'hello3.png', id: 'media3' },
      ]);

      expect(
        serviceMock.prototype.createTransaction
      ).toHaveBeenCalledExactlyOnceWith(3);

      expect(serviceMock.prototype.uploadFiles).toHaveBeenCalledExactlyOnceWith(
        'txn1',
        [
          { id: 'media1', file: file1 },
          { id: 'media2', file: file2 },
          { id: 'media3', file: file3 },
        ],
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should call progress handler in new upload', async ({
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

      await controller.newUpload(mockFileList.fileList, onProgressMock);

      expect(updateMediaProgressesMock).toHaveBeenCalledExactlyOnceWith([
        1, 2, 3,
      ]);
      expect(onProgressMock).toHaveBeenCalledOnce();
    });

    it('should call complete handler in new upload', async ({
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

      await controller.newUpload(
        mockFileList.fileList,
        vi.fn(),
        onCompleteMock
      );

      expect(completeMock).toHaveBeenCalledOnce();
      expect(onCompleteMock).toHaveBeenCalledOnce();
    });
  });

  describe('stopUpload', () => {
    it('should stop an upload', async ({ getController, mockFileList }) => {
      const controller = getController.controller;
      const serviceMock = getController.serviceMock;

      const stopperMock = vi.fn();
      serviceMock.prototype.uploadFiles.mockReturnValue(stopperMock);
      await controller.newUpload(mockFileList.fileList);

      expect(controller.stopUpload('txn1')).toBe(true);

      expect(stopperMock).toHaveBeenCalledOnce();

      expect(transactionStopMock).toHaveBeenCalledOnce();
    });

    it('should stop non existing upload', ({ getController }) => {
      const controller = getController.controller;

      expect(controller.stopUpload('txn1')).toBe(false);
    });
  });

  describe('completeTxnPartially', () => {
    it('should complete a transaction partially', async ({
      getController,
      mockFileList,
    }) => {
      const controller = getController.controller;

      await controller.newUpload(mockFileList.fileList);

      anyFileUploadedMock.mockReturnValue(true);

      expect(controller.completeTxnPartially('txn1')).toBe(true);
      expect(completePartiallyMock).toHaveBeenCalledOnce();
    });

    it('should delete the transaction on partial completion of media uploads', async ({
      getController,
      mockFileList,
    }) => {
      const controller = getController.controller;

      await controller.newUpload(mockFileList.fileList);

      anyFileUploadedMock.mockReturnValue(false);

      const removeTransactionMock = vi.spyOn(controller, 'removeTransaction');
      expect(controller.completeTxnPartially('txn1')).toBe(false);
      expect(completePartiallyMock).toBeCalledTimes(0);
      expect(removeTransactionMock).toBeCalledTimes(1);
    });

    it('should do nothing if txn entry missing for partial complete', async ({
      getController,
      mockFileList,
    }) => {
      const controller = getController.controller;

      await controller.newUpload(mockFileList.fileList);

      expect(controller.completeTxnPartially('txn1')).toBe(false);
      expect(completePartiallyMock).toBeCalledTimes(0);
    });
  });

  describe('removeTransaction', () => {
    it('should remove transaction', async ({ getController, mockFileList }) => {
      const controller = getController.controller;

      await controller.newUpload(mockFileList.fileList);

      expect(controller.removeTransaction('txn1')).toBe(true);
      expect(controller.hasTransaction('txn1')).toBe(false);
    });
  });

  describe('getFailedTxnMediaFiles', () => {
    it('should get failed txn media files', async ({
      getController,
      mockFileList,
    }) => {
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

      await controller.newUpload(mockFileList.fileList);

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
  });

  describe('getTransactions', () => {
    it('should get transaction objects', async ({
      getController,
      mockFileList,
    }) => {
      const controller = getController.controller;

      await controller.newUpload(mockFileList.fileList);

      const expected = ['transaction'];

      getObjectMock.mockReturnValue('transaction');

      expect(controller.getTransactions()).toStrictEqual(expected);
      expect(getObjectMock).toHaveBeenCalledOnce();
    });
  });

  describe('commitTransaction', () => {
    it('should commit a transaction', async ({
      getController,
      mockFileList,
    }) => {
      const { controller, serviceMock } = getController;

      await controller.newUpload(mockFileList.fileList);

      isCompletedMock.mockReturnValue(true);

      const removeTxnMock = vi.spyOn(controller, 'removeTransaction');
      const result = await controller.commitTransaction('txn1');

      expect(result).toBe(true);
      expect(
        serviceMock.prototype.commitTransaction
      ).toHaveBeenCalledExactlyOnceWith('txn1');
      expect(removeTxnMock).toHaveBeenCalledExactlyOnceWith('txn1');
    });

    it('should not commit an in-progress transaction', async ({
      getController,
      mockFileList,
    }) => {
      const { controller, serviceMock } = getController;

      await controller.newUpload(mockFileList.fileList);

      isCompletedMock.mockReturnValue(false);
      const removeTxnMock = vi.spyOn(controller, 'removeTransaction');

      const result = await controller.commitTransaction('txn1');

      expect(result).toBe(false);
      expect(serviceMock.prototype.commitTransaction).not.toBeCalled();
      expect(removeTxnMock).not.toBeCalled();
    });
  });
});
