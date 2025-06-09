import "./header.css";

import SearchBar from 'src/components/SearchBar/SearchBar';
import Upload from 'src/components/Upload/Upload';
import UserProfile from 'src/components/UserProfile/UserProfile';
import Logo from 'src/components/Logo/Logo';

const Header = () => {
  return <div>
    <div className="app-header">
      <Logo />
      <SearchBar />
      <Upload />
      <UserProfile />
    </div>
  </div>
};

export default Header;