import { useCallback, useState } from 'react';

import ProgressBar from 'src/components/ProgressBar/ProgressBar';

import Button from 'src/components/Button/Button';
import Modal from 'src/components/MediaUploader/Modal/Modal';
import CollapsableMediaItems from 'src/components/MediaUploader/CollapsableMediaItems/CollapsableMediaItems';

import './styles.css';
import type { InProgressStateProps } from './types';

const InProgressState = (props: InProgressStateProps) => {
  const [showMore, setShowMore] = useState<boolean>(false);

  const showMoreHandler = useCallback(() => {
    setShowMore((prev) => !prev);
  }, []);

  return (
    <Modal>
      <div className='upload-in-progress'>
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
        <div className='upload-controls'>
          <Button variant='contained' onClick={props.onStop}>
            Stop
          </Button>
          <Button
            variant='text'
            onClick={showMoreHandler}
            style={{ marginLeft: '0.5em' }}
          >
            {showMore ? 'Show less' : 'Show more'}
          </Button>
        </div>
        <CollapsableMediaItems mediaItems={props.mediaItems} open={showMore} />
      </div>
    </Modal>
  );
};

export default InProgressState;
