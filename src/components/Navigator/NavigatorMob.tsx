import MenuIcon from '@mui/icons-material/Menu';

import { Drawer, IconButton } from '@mui/material';
import Navigation from 'src/components/Navigation/Navigation';

import { useCallback, useState } from 'react';

import './navigatormob.css';
import StorageBar from 'src/components/StorageBar/StorageBar';
import UserProfile from 'src/components/UserProfile/UserProfile';
import Logo from 'src/components/Logo/Logo';

const NavigatorMob = () => {
  const [open, setOpen] = useState<boolean>(false);

  const openMenu = useCallback(() => {
    setOpen(true);
  }, []);
  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <div className='navigator-mob'>
      <div className='navigator-mob-menu'>
        <IconButton
          aria-label='menu'
          sx={{ color: 'inherit' }}
          onClick={openMenu}
        >
          <MenuIcon />
        </IconButton>
      </div>
      <div className='navigator-mob-slider'>
        <Drawer anchor='left' open={open} onClose={closeMenu}>
          <div className='navigator-header'>
            <Logo />
            <UserProfile />
          </div>
          <div className='navigator-content'>
            <Navigation />
            <StorageBar />
          </div>
        </Drawer>
      </div>
    </div>
  );
};

export default NavigatorMob;
