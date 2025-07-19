import { LinearProgress } from '@mui/material';
import './progressbar.css';
import type { ProgressBarProps } from 'src/components/ProgressBar/types';

const ProgressBar = (props: ProgressBarProps) => {
  return (
    <LinearProgress
      variant='determinate'
      value={props.value}
      className='progressbar'
      sx={{ height: props.lineWeight }}
    />
  );
};

export default ProgressBar;
