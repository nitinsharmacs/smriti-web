import UploadIcon from '@mui/icons-material/Upload';
import { Button, IconButton } from '@mui/material';

import './upload.css';
import { createUploadTxn } from 'src/components/MediaUploader/UploadProvider';

const Upload = () => {
  const file1 = new File(['Hello world'], 'hello.txt', {
    type: 'text/plain',
  });

  const file2 = new File(['Hello world'], 'hello2.txt', {
    type: 'text/plain',
  });

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file1);
  dataTransfer.items.add(file2);

  return (
    <div className='upload'>
      <Button
        component='label'
        variant='text'
        startIcon={<UploadIcon />}
        className='upload-btn-web'
        sx={{ textTransform: 'inherit' }}
        onClick={() => createUploadTxn(dataTransfer.files)}
      >
        Upload
      </Button>

      <IconButton
        aria-label='upload'
        className='upload-btn-mob'
        onClick={() => createUploadTxn(dataTransfer.files)}
      >
        <UploadIcon />
      </IconButton>
    </div>
  );
};

export default Upload;
