import './photos.css';

import { Grid } from 'scrubbable-photo-grid';
import type {
  GridConfigType,
  SectionType,
} from 'scrubbable-photo-grid/dist/types';

import { useCallback, useRef, useState } from 'react';
import images from '../../../data/images.json';
import type { SelectBarControl } from 'src/components/SelectBar/types';

import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import SelectBar from 'src/components/SelectBar/SelectBar';
import type { GridSelectionHandler } from 'scrubbable-photo-grid/dist/Grid/types';

const gridData = images.slice(0, 10) as SectionType[];

const gridConfig: GridConfigType = {
  containerWidth: 900,
  targetRowHeight: 150,
  segmentMargin: 5,
  sectionMargin: 10,
};

const Photos = () => {
  const selectBarControls: SelectBarControl[] = [
    {
      icon: DeleteIcon,
      handler: () => alert('deleted'),
    },
    {
      icon: ShareIcon,
      handler: () => alert('shared'),
    },
  ];

  const [open, setOpen] = useState<boolean>(false);
  const [selections, setSelections] = useState<number>(0);

  const selectHandler = useCallback<GridSelectionHandler>((selections) => {
    if (Object.keys(selections).length === 0) {
      return setOpen(false);
    }

    setSelections(
      Object.values(selections).flatMap((segments) =>
        Object.values(segments).flatMap((seg) => seg)
      ).length
    );
    setOpen(true);
  }, []);

  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <SelectBar
        open={open}
        selections={selections}
        onClose={() => setOpen(false)}
        controls={selectBarControls}
      />
      <div className='photos' ref={ref}>
        <Grid
          gridData={gridData}
          config={gridConfig}
          parent={ref}
          onSelect={selectHandler}
        />
      </div>
    </>
  );
};

export default Photos;
