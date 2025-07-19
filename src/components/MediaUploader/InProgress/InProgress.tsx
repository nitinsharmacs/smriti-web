import { useCallback, useState } from 'react';

import ProgressBar from 'src/components/ProgressBar/ProgressBar';

import './inprogress.css';
import Button from 'src/components/Button/Button';
import Modal from 'src/components/MediaUploader/Modal/Modal';
import CollapsableMediaItems from 'src/components/MediaUploader/CollapsableMediaItems/CollapsableMediaItems';

const InProgress = () => {
  const [showMore, setShowMore] = useState<boolean>(false);

  const showMoreHandler = useCallback(() => {
    setShowMore((prev) => !prev);
  }, []);

  return (
    <Modal>
      <div className='upload-in-progress'>
        <h4>Media getting uploaded</h4>
        <div className='upload-progressbar'>
          <ProgressBar value={50} lineWeight={8} />
          <div className='items-completion-indicator'>1 of 4 done</div>
        </div>
        <div className='upload-controls'>
          <Button variant='contained'>Stop</Button>
          <Button
            variant='text'
            onClick={showMoreHandler}
            style={{ marginLeft: '0.5em' }}
          >
            Show more
          </Button>
        </div>
        <CollapsableMediaItems open={showMore} />
      </div>
    </Modal>
  );
};

export default InProgress;
