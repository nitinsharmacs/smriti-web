import Modal from 'src/components/MediaUploader/Modal/Modal';
import Button from 'src/components/Button/Button';

import './completestate.css';
import type { CompleteStateProps } from 'src/components/MediaUploader/CompleteState/types';

const CompleteState = ({
  achievedUploads,
  targetUploads,
  previews,
  onComplete,
  onCancel,
}: CompleteStateProps) => {
  return (
    <Modal>
      <div className='upload-complete-modal'>
        <div className='upload-complete-content'>
          <h4>
            Upload completed
            {achievedUploads < targetUploads ? ' partially' : ''}
          </h4>
          <div className='upload-summary'>
            {achievedUploads} of {targetUploads} files uploaded successfully.
            <br />
            Please click <b>Complete</b> to store permanently.
          </div>
          <div className='complete-controls'>
            <Button variant='contained' onClick={onComplete}>
              Complete
            </Button>
            <Button
              variant='text'
              onClick={onCancel}
              style={{ marginLeft: '0.5em' }}
            >
              Cancel
            </Button>
          </div>
        </div>
        {/* TODO:
         * - preview can be improved with multiple images.
         * - preview can be clickable that opens a screen with all the
         * uploaded images.
         */}
        <div className='upload-preview'>
          <figure>
            <img src={previews[0]} alt='upload-preview' />
          </figure>
        </div>
      </div>
    </Modal>
  );
};

export default CompleteState;
