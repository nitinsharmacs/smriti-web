import type { SideBarProps } from './sidebar.types';

const SideBar = (props: SideBarProps) => {
  return <div>
    {props.children}
  </div>
}

export default SideBar;