import { Typography } from "@mui/material";

import "./logo.css";

const Logo = () => {
  return <Typography
          variant="h1"
          noWrap
          component="a"
          sx={{
            fontFamily: 'inherit',
          }}
          className='logo'
        >
          smriti
        </Typography>
};

export default Logo;