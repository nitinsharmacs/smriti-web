import { useCallback, useMemo, useState } from 'react';

import UploadController from 'src/controllers/UploadController';
import UploadService from 'src/services/UploadService';

import UploadContainer from './UploadContainer/UploadContainer';
import UploadTxn from './UploadTxn/UploadTxn';

import type { UploadTxnControl } from './UploadTxn/types';
import type {
  ProviderContext,
  ProviderProps,
  UploadTxnCreator,
  UploadTxnType,
} from './types';
import React from 'react';
import { doNothing } from 'src/helpers';
import { BASE_URL } from 'src/constants';

export const UploadContext = React.createContext<ProviderContext>({
  createUploadTxn: doNothing,
});

export let createUploadTxn: UploadTxnCreator;

const UploadProvider = ({ children }: ProviderProps) => {
  const [transactions, updateTxn] = useState<UploadTxnType[]>([]);

  const uploadController = useMemo(
    () => new UploadController(new UploadService(BASE_URL)),
    []
  );

  const updateTransactions = useCallback(() => {
    updateTxn(uploadController.getTransactions());
  }, []);

  const createUploadTxnHandler = useCallback<UploadTxnCreator>(
    async (files) => {
      await uploadController.newUpload(
        files,
        updateTransactions,
        updateTransactions
      );

      updateTransactions();
    },
    []
  );

  const completeTxnHandler = useCallback<UploadTxnControl>(async (txnId) => {
    await uploadController.commitTransaction(txnId);

    updateTransactions();
  }, []);

  const stopTxnHandler = useCallback<UploadTxnControl>((txnId) => {
    uploadController.stopUpload(txnId);

    updateTransactions();
  }, []);

  const retryTxnHandler = useCallback<UploadTxnControl>((txnId) => {
    const files = uploadController.getFailedTxnMediaFiles(txnId);

    if (files.length > 0) createUploadTxnHandler(files);

    uploadController.completeTxnPartially(txnId);

    updateTransactions();
  }, []);

  const cancelTxnHandler = useCallback<UploadTxnControl>(
    async (txnId, origin) => {
      await uploadController.cancelTransaction(txnId, origin);
      updateTransactions();
    },
    []
  );

  createUploadTxn = createUploadTxnHandler;

  return (
    <UploadContext.Provider value={{ createUploadTxn: createUploadTxnHandler }}>
      {children}
      {
        <UploadContainer>
          {transactions.map((txn) => (
            <UploadTxn
              key={txn.txnId}
              txnId={txn.txnId}
              status={txn.status}
              state={txn.state}
              onComplete={completeTxnHandler}
              onStop={stopTxnHandler}
              onRetry={retryTxnHandler}
              onCancel={cancelTxnHandler}
            />
          ))}
        </UploadContainer>
      }
    </UploadContext.Provider>
  );
};

export default UploadProvider;
