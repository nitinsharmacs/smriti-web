import ProgressBar from 'src/components/ProgressBar/ProgressBar';

import Button from 'src/components/Button/Button';
import Modal from 'src/components/MediaUploader/Modal/Modal';

import './styles.css';
import type { InProgressStateProps } from './types';
import MediaItem from 'src/components/MediaUploader/MediaItem/MediaItem';
import ExpandableModal from 'src/components/MediaUploader/ExpandableModal/ExpandableModal';

const InProgressState = (props: InProgressStateProps) => {
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
          <Button
            key='progress-stop-btn'
            variant='contained'
            onClick={props.onStop}
          >
            Stop
          </Button>,
        ]}
      >
        <h4>Media getting uploaded</h4>
        <div className='upload-progressbar'>
          <ProgressBar
            value={(props.achievedUploads / props.targetUploads) * 100}
            lineWeight={8}
          />
          <div className='items-completion-indicator'>
            {props.achievedUploads} of {props.targetUploads} done
          </div>
        </div>
      </ExpandableModal>
    </Modal>
  );
};

export default InProgressState;
