import type { SideBarProps } from './sidebar.types';

import './sidebar.css';

const SideBar = (props: SideBarProps) => {
  return <div className='sidebar'>{props.children}</div>;
};

export default SideBar;
