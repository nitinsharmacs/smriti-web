import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CollectionsIcon from '@mui/icons-material/Collections';

import './navigation.css';

const Navigation = () => {
  return (
    <div className='navigation'>
      <List>
        <ListItem key='photos' disablePadding>
          <ListItemButton className='navigation-link'>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <ImageIcon />
            </ListItemIcon>
            <ListItemText primary='Photos' />
          </ListItemButton>
        </ListItem>
        <ListItem key='albums' disablePadding>
          <ListItemButton className='navigation-link'>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <CollectionsIcon />
            </ListItemIcon>
            <ListItemText primary='Albums' />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
};

export default Navigation;
