import { Box, Typography } from '@mui/material';
import './storagebar.css';
import ProgressBar from 'src/components/ProgressBar/ProgressBar';

const StorageBar = () => {
  return (
    <Box className='storagebar'>
      <Typography variant='h4' component='h4'>
        Storage Used
      </Typography>
      <div>
        <ProgressBar lineWeight={6} value={20} />
        <Typography variant='h6' component='h6'>
          10GB of 100GB used
        </Typography>
      </div>
    </Box>
  );
};

export default StorageBar;
