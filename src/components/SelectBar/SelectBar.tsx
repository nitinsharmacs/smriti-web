import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

import './selectbar.css';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import type { SelectBarProps } from 'src/components/SelectBar/types';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

const SelectBar = (props: SelectBarProps) => {
  return (
    <div>
      <Slide direction='down' in={props.open}>
        <Toolbar className='select-bar'>
          <div>
            <IconButton
              className='select-bar-close-btn'
              onClick={props.onClose}
            >
              <ClearIcon />
            </IconButton>
          </div>
          <div className='select-bar-display-text'>
            <span>{props.selections || 0}</span>
            <span>Selected</span>
          </div>
          <div className='select-bar-controls'>
            {props.controls.map((control, index) => (
              <IconButton
                onClick={control.handler}
                className='select-bar-control'
                key={`select-bar-control-${index}`}
              >
                {control.icon ? <control.icon /> : <NotInterestedIcon />}
              </IconButton>
            ))}
          </div>
        </Toolbar>
      </Slide>
    </div>
  );
};

export default SelectBar;
