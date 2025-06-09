import { Avatar, Box, IconButton, Tooltip } from "@mui/material";

import "./userprofile.css";

const UserProfile = () => {
  return <Box className="user-profile">
          <Tooltip title="Open settings">
            <IconButton sx={{ p: 0 }}>
              <Avatar alt="Remy Sharp"/>
            </IconButton>
          </Tooltip>
        </Box>
};

export default UserProfile;