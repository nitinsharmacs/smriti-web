import CircularProgress, {
  circularProgressClasses,
} from '@mui/material/CircularProgress';
import type { CircularProgressBarProps } from './types';

import './circularprogress.css';

const CircularProgressBar = (props: CircularProgressBarProps) => {
  return (
    <div
      style={{ position: 'relative', width: props.size, height: props.size }}
      className='circular-progressbar'
    >
      <CircularProgress
        variant='determinate'
        sx={{
          position: 'absolute',
        }}
        thickness={props.thickness || 4}
        size={props.size}
        value={100}
        className='circular-progressbar-bg'
      />
      <CircularProgress
        variant='determinate'
        className='circular-progressbar-stroke'
        disableShrink
        sx={{
          position: 'absolute',
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: 'round',
          },
        }}
        size={props.size}
        thickness={props.thickness || 4}
        value={props.value}
      />
    </div>
  );
};

export default CircularProgressBar;
