import UploadIcon from '@mui/icons-material/Upload';
import { Button } from '@mui/material';

import "./upload.css";

const Upload = () => {
  return <div className="upload">
    <Button
      component="label"
      variant="text"
      tabIndex={-1}
      startIcon={<UploadIcon />}
      className='upload-btn'
    >
      Upload files
    </Button>
  </div>
};

export default Upload;