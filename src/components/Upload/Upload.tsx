import UploadIcon from '@mui/icons-material/Upload';
import { Button, IconButton } from '@mui/material';

import './upload.css';
import { createUploadTxn } from 'src/components/MediaUploader/UploadContext';

import { useCallback, useRef, type ChangeEvent } from 'react';

const Upload = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const upload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    createUploadTxn(event.target.files as FileList);
  }, []);

  return (
    <div className='upload'>
      <div style={{ display: 'none' }}>
        <label htmlFor='media-uploader'>Upload media</label>
        <input
          ref={inputRef}
          type='file'
          id='media-uploader'
          onChange={upload}
          multiple
        />
      </div>
      <Button
        component='label'
        variant='text'
        startIcon={<UploadIcon />}
        className='upload-btn-web'
        sx={{ textTransform: 'inherit' }}
        onClick={openFileDialog}
      >
        Upload
      </Button>

      <IconButton
        aria-label='upload'
        className='upload-btn-mob'
        onClick={openFileDialog}
      >
        <UploadIcon />
      </IconButton>
    </div>
  );
};

export default Upload;
