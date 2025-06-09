import SearchIcon from '@mui/icons-material/Search';
import { Box } from '@mui/material';

import './searchbar.css';

const SearchBar = () => {
  return (
    <div className='searchbar'>
      <Box className='searchbar-input'>
        <SearchIcon />
        <input placeholder='Search...' />
      </Box>
    </div>
  );
};

export default SearchBar;
