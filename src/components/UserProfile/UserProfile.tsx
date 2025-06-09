import { Avatar, Box, IconButton, Tooltip, Typography } from '@mui/material';

import './userprofile.css';

const UserProfile = () => {
  return (
    <Box className='user-profile'>
      <Typography variant='h4' component='h4'>
        User
      </Typography>
      <Tooltip title='Open settings'>
        <IconButton sx={{ p: 0 }}>
          <Avatar alt='Remy Sharp' />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default UserProfile;
