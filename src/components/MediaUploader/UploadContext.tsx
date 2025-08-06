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

export const UploadContext = React.createContext<ProviderContext>({
  createUploadTxn: doNothing,
});

export let createUploadTxn: UploadTxnCreator;

const UploadProvider = ({ children }: ProviderProps) => {
  const [transactions, updateTxn] = useState<UploadTxnType[]>([]);

  const uploadController = useMemo(
    () => new UploadController(new UploadService()),
    []
  );

  const updateTransactions = useCallback(() => {
    updateTxn(uploadController.getTransactions());
  }, []);

  const createUploadTxnHandler = useCallback<UploadTxnCreator>((files) => {
    uploadController.newUpload(files, updateTransactions, updateTransactions);

    updateTransactions();
  }, []);

  const completeTxnHandler = useCallback<UploadTxnControl>((txnId) => {
    console.log('complete transaction, ', txnId);
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
            />
          ))}
        </UploadContainer>
      }
    </UploadContext.Provider>
  );
};

export default UploadProvider;
