import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';

import './selectbar.css';

const SelectBar = () => {
  return (
    <div className='select-bar'>
      <div>
        <IconButton className='select-bar-close-btn'>
          <ClearIcon />
        </IconButton>
      </div>
      <div className='select-bar-display-text'>
        <span>2</span>
        <span>Selected</span>
      </div>
      <div className='select-bar-controls'>
        <div className='select-bar-control'>
          <IconButton className='select-bar-close-btn'>
            <DeleteIcon />
          </IconButton>
          <IconButton className='select-bar-close-btn'>
            <ShareIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default SelectBar;
