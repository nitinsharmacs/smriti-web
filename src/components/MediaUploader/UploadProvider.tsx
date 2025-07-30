import { useCallback, useMemo, useState } from 'react';
import UploadContainer from 'src/components/MediaUploader/UploadContainer/UploadContainer';
import UploadTxn from 'src/components/MediaUploader/UploadTxn/UploadTxn';
import UploadContext from './UploadContext';
import type { ProviderProps, UploadTxnCreator, UploadTxnType } from './types';
import type { UploadTxnControl } from 'src/components/MediaUploader/UploadTxn/types';
import UploadController from 'src/controllers/UploadController';

export let createUploadTxn: UploadTxnCreator;

const UploadProvider = ({ children }: ProviderProps) => {
  const [transactions, updateTxn] = useState<UploadTxnType[]>([]);

  const uploadController = useMemo(() => new UploadController(), []);

  const updateTransactions = useCallback(() => {
    updateTxn(uploadController.getTransactions());
  }, []);

  const createUploadTxnHandler = useCallback<UploadTxnCreator>((files) => {
    const txnId = uploadController.newUpload(
      files,
      updateTransactions,
      updateTransactions
    );

    console.log('created new txn', txnId);

    updateTransactions();
  }, []);

  const completeTxnHandler = useCallback<UploadTxnControl>((txnId) => {
    console.log('complete transaction, ', txnId);
  }, []);

  const stopTxnHandler = useCallback<UploadTxnControl>((txnId) => {
    uploadController.stopUpload(txnId);

    updateTransactions();

    console.log('Stopping Transaction, ', txnId);
  }, []);

  const retryTxnHandler = useCallback<UploadTxnControl>((txnId) => {
    console.log('retry transaction, ', txnId);

    const files = uploadController.getFailedTxnMediaFiles(txnId);

    if (files.length > 0) createUploadTxnHandler(files);

    uploadController.completeTxnPartially(txnId);

    updateTransactions();
  }, []);

  createUploadTxn = createUploadTxnHandler;

  console.log(transactions);

  return (
    <UploadContext value={{ createUploadTxn: createUploadTxnHandler }}>
      {children}
      {
        <UploadContainer>
          {transactions.map((txn) => (
            <UploadTxn
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

/**
 * const transactions: UploadTxnType[] = [
    {
      txnId: 'txn1',
      status: UploadTxnStatus.InProgress,
      state: {
        targetUploads: 4,
        achievedUploads: 2,
        mediaItems: [
          {
            type: MediaType.Image,
            name: 'screenshot.jpeg',
            status: MediaUploadStatus.InProgress,
            progress: 50,
          },
          {
            type: MediaType.Image,
            name: 'screenshot2.jpeg',
            status: MediaUploadStatus.Success,
            progress: 100,
          },
        ],
      },
    },
    {
      txnId: 'txn2',
      status: UploadTxnStatus.Success,
      state: {
        targetUploads: 4,
        achievedUploads: 4,
        previews: [
          'https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k',
        ],
      },
    },
    {
      txnId: 'txn3',
      status: UploadTxnStatus.Success,
      state: {
        targetUploads: 4,
        achievedUploads: 2,
        previews: [
          'https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k',
        ],
      },
    },
    {
      txnId: 'txn4',
      status: UploadTxnStatus.Retry,
      state: {
        targetUploads: 4,
        achievedUploads: 2,
        mediaItems: [
          {
            type: MediaType.Image,
            name: 'screenshot.jpeg',
            status: MediaUploadStatus.InProgress,
            progress: 50,
          },
          {
            type: MediaType.Image,
            name: 'screenshot2.jpeg',
            status: MediaUploadStatus.Success,
            progress: 100,
          },
        ],
      },
    },
  ];
 */
