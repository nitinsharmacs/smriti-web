import { useCallback, useMemo, useState } from 'react';

import UploadContainer from 'src/components/MediaUploader/UploadContainer/UploadContainer';
import UploadTxn from 'src/components/MediaUploader/UploadTxn/UploadTxn';
import UploadController from 'src/controllers/UploadController';
import UploadService from 'src/services/UploadService';
import UploadContext from './UploadContext';

import type { UploadTxnControl } from 'src/components/MediaUploader/UploadTxn/types';
import type { ProviderProps, UploadTxnCreator, UploadTxnType } from './types';

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
    <UploadContext value={{ createUploadTxn: createUploadTxnHandler }}>
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
    </UploadContext>
  );
};

export default UploadProvider;
