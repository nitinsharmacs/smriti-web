import './header.css';

import SearchBar from 'src/components/SearchBar/SearchBar';
import Upload from 'src/components/Upload/Upload';
import UserProfile from 'src/components/UserProfile/UserProfile';
import Logo from 'src/components/Logo/Logo';
import NavigatorMob from 'src/components/Navigator/NavigatorMob';

const Header = () => {
  return (
    <div>
      <div className='app-header'>
        <NavigatorMob />
        <Logo />
        <SearchBar />
        <Upload />
        <UserProfile />
      </div>
    </div>
  );
};

export default Header;
