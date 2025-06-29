import './photos.css';

import { Grid } from 'scrubbable-photo-grid';
import type {
  GridConfigType,
  SectionType,
} from 'scrubbable-photo-grid/dist/types';

import { createRef } from 'react';
import images from '../../../data/images.json';

const gridData = images.slice(0, 10) as SectionType[];

const gridConfig: GridConfigType = {
  containerWidth: 900,
  targetRowHeight: 150,
  segmentMargin: 5,
  sectionMargin: 10,
};

const Photos = () => {
  const ref = createRef<HTMLDivElement>();

  return (
    <div className='photos' ref={ref}>
      <Grid gridData={gridData} config={gridConfig} parent={ref} />
    </div>
  );
};

export default Photos;
