import {
  CancelOrigin,
  type UploadTxnProps,
} from 'src/components/MediaUploader/UploadTxn/types';
import './styles.css';
import InProgressState from 'src/components/MediaUploader/InProgressState/InProgressState';
import CompleteState from 'src/components/MediaUploader/CompleteState/CompleteState';
import RetryState from 'src/components/MediaUploader/RetryState/RetryState';
import {
  UploadTxnStatus,
  type CompletedStateType,
  type InProgressStateType,
  type RetryStateType,
} from 'src/components/MediaUploader/types';
import { useCallback } from 'react';

const UploadTxn = (props: UploadTxnProps) => {
  const onStopHandler = useCallback(() => {
    props.onStop(props.txnId);
  }, [props]);

  const onCompleteHandler = useCallback(() => {
    props.onComplete(props.txnId);
  }, [props]);

  const onRetryHandler = useCallback(() => {
    props.onRetry(props.txnId);
  }, [props]);

  switch (props.status) {
    case UploadTxnStatus.InProgress: {
      const progressState = props.state as InProgressStateType;

      return (
        <InProgressState
          achievedUploads={progressState.achievedUploads}
          targetUploads={progressState.targetUploads}
          mediaItems={progressState.mediaItems}
          onStop={onStopHandler}
        />
      );
    }
    case UploadTxnStatus.Success: {
      const completedState = props.state as CompletedStateType;

      return (
        <CompleteState
          achievedUploads={completedState.achievedUploads}
          targetUploads={completedState.targetUploads}
          previews={completedState.previews}
          onComplete={onCompleteHandler}
          onCancel={() => props.onCancel(props.txnId, CancelOrigin.Completed)}
        />
      );
    }
    case UploadTxnStatus.Retry: {
      const retryState = props.state as RetryStateType;
      return (
        <>
          <RetryState
            achievedUploads={retryState.achievedUploads}
            targetUploads={retryState.targetUploads}
            mediaItems={retryState.mediaItems}
            onRetry={onRetryHandler}
            onCancel={() => props.onCancel(props.txnId, CancelOrigin.Retry)}
          />
          {retryState.achievedUploads > 0 ? (
            <CompleteState
              achievedUploads={retryState.achievedUploads}
              targetUploads={retryState.targetUploads}
              previews={retryState.previews}
              onComplete={onCompleteHandler}
              onCancel={() =>
                props.onCancel(props.txnId, CancelOrigin.RetryCompleted)
              }
            />
          ) : (
            <></>
          )}
        </>
      );
    }
    default:
      return <></>;
  }
};

export default UploadTxn;
