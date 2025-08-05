import type { ExpandableModalProps } from 'src/components/MediaUploader/ExpandableModal/types';
import './styles.css';
import Button from 'src/components/Button/Button';
import { useState, useCallback } from 'react';
import CollapsableList from 'src/components/CollapsableList/CollapsableList';

const ExpandableModal = (props: ExpandableModalProps) => {
  const [showMore, setShowMore] = useState<boolean>(false);

  const showMoreHandler = useCallback(() => {
    setShowMore((prev) => !prev);
  }, []);

  return (
    <div className='expandable-modal'>
      <div className='content'>{props.children}</div>
      <div className='actions'>
        {props.actions}
        <Button
          variant='text'
          onClick={showMoreHandler}
          style={{ marginLeft: '0.5em' }}
        >
          {showMore ? 'Show less' : 'Show more'}
        </Button>
      </div>
      <div
        className='expandable-content'
        style={{ marginTop: showMore ? '1em' : '' }}
      >
        <CollapsableList open={showMore}>
          {props.expandableContent}
        </CollapsableList>
      </div>
    </div>
  );
};

export default ExpandableModal;
