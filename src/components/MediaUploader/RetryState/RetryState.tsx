import Button from 'src/components/Button/Button';
import Modal from 'src/components/MediaUploader/Modal/Modal';
import ExpandableModal from 'src/components/MediaUploader/ExpandableModal/ExpandableModal';
import MediaItem from 'src/components/MediaUploader/MediaItem/MediaItem';
import type { RetryStateProps } from 'src/components/MediaUploader/RetryState/types';

import './styles.css';

const RetryState = (props: RetryStateProps) => {
  return (
    <Modal>
      <ExpandableModal
        expandableContent={props.mediaItems.map((item) => (
          <MediaItem
            key={item.id}
            name={item.name}
            type={item.type}
            status={item.status}
            progress={item.progress}
          />
        ))}
        actions={[
          <Button key='retry-btn' variant='contained' onClick={props.onRetry}>
            Retry
          </Button>,
          <Button
            key='cancel-btn'
            variant='text'
            onClick={props.onCancel}
            style={{ marginLeft: '0.5em' }}
          >
            Cancel
          </Button>,
        ]}
      >
        <h4 className='retry-modal-heading'>
          {props.targetUploads - props.achievedUploads} out of{' '}
          {props.targetUploads} uploads remaining
        </h4>
      </ExpandableModal>
    </Modal>
  );
};

export default RetryState;
