import type { ReactElement } from 'react';
import type { LayoutProps } from 'src/components/Layout/layout.types';

import Header from 'src/components/Header/Header';
import SideBar from 'src/components/Sidebar/Sidebar';

import './layout.css';
import Navigation from 'src/components/Navigation/Navigation';
import StorageBar from 'src/components/StorageBar/StorageBar';

const Layout = (props: LayoutProps): ReactElement => {
  return (
    <div className='page-layout'>
      <Header />
      <div className='page-container'>
        <SideBar>
          <Navigation />
          <StorageBar />
        </SideBar>
        <div className='page-content'>{props.children}</div>
      </div>
    </div>
  );
};

export default Layout;
