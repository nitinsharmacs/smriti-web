import { useCallback, useState } from 'react';
import UploadContainer from 'src/components/MediaUploader/UploadContainer/UploadContainer';
import UploadTxn from 'src/components/MediaUploader/UploadTxn/UploadTxn';
import UploadContext from './UploadContext';
import type {
  InProgressStateType,
  ProviderProps,
  UploadTxnCreator,
  UploadTxnType,
} from './types';
import { MediaType, MediaUploadStatus, UploadTxnStatus } from './types';
import UploadTransaction from 'src/model/UploadTransaction';
import type { UploadTxnControl } from 'src/components/MediaUploader/UploadTxn/types';

export let createUploadTxn: UploadTxnCreator;

const UploadProvider = ({ children }: ProviderProps) => {
  const [transactions, updateTxn] = useState<UploadTxnType[]>([]);
  const txnUploaders: UploadTransaction[] = [];

  const createUploadTxnHandler = useCallback<UploadTxnCreator>((files) => {
    const txn = new UploadTransaction(files);
    txnUploaders.push(txn);

    txn.startUpload();

    updateTxn((prev) => {
      return [...prev, txn.getObject()];
    });

    txn.onProgress(() => {
      console.log('called');

      updateTxn((prev) => {
        const index = prev.findIndex((_txn) => _txn.txnId === txn.txnId);
        prev[index] = txn.getObject();
        return [...prev];
      });
    });

    txn.onComplete(() => {
      updateTxn((prev) => {
        const index = prev.findIndex((_txn) => _txn.txnId === txn.txnId);
        prev[index] = txn.getObject();
        return [...prev];
      });
    });
  }, []);

  const completeTxnHandler = useCallback<UploadTxnControl>((txnId) => {
    console.log('complete transaction, ', txnId);
  }, []);

  const stopTxnHandler = useCallback<UploadTxnControl>((txnId) => {
    const txn = txnUploaders.find((uploader) => uploader.txnId === txnId);

    if (!txn) {
      return;
    }

    txn.stop();

    updateTxn((prev) => {
      const index = prev.findIndex((_txn) => _txn.txnId === txn.txnId);
      prev[index] = txn?.getObject();
      return [...prev];
    });

    console.log('stop transaction, ', txnId);
  }, []);

  const retryTxnHandler = useCallback<UploadTxnControl>((txnId) => {
    // should create a new transaction for remaining uploads.
    console.log('retry transaction, ', txnId);
  }, []);

  createUploadTxn = createUploadTxnHandler;

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
