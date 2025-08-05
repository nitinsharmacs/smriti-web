import Collapse from '@mui/material/Collapse';
import type { CollapsableListProps } from 'src/components/CollapsableList/types';

import './styles.css';

const CollapsableList = ({ open, children }: CollapsableListProps) => {
  return (
    <div className='collapsable-media-items'>
      <Collapse in={open} timeout='auto' unmountOnExit>
        <div>{children}</div>
      </Collapse>
    </div>
  );
};

export default CollapsableList;
