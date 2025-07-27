import UploadIcon from '@mui/icons-material/Upload';
import { Button, IconButton } from '@mui/material';

import './upload.css';
import { createUploadTxn } from 'src/components/MediaUploader/UploadProvider';

const Upload = () => {
  return (
    <div className='upload'>
      <Button
        component='label'
        variant='text'
        startIcon={<UploadIcon />}
        className='upload-btn-web'
        sx={{ textTransform: 'inherit' }}
        onClick={() => createUploadTxn([])}
      >
        Upload
      </Button>

      <IconButton aria-label='upload' className='upload-btn-mob'>
        <UploadIcon />
      </IconButton>
    </div>
  );
};

export default Upload;
