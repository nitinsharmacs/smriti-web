import { Container } from "@mui/material";

import type { ReactElement } from "react";
import type { LayoutProps } from "src/components/Layout/layout.types";

import Header from "src/components/Header/Header";
import SideBar from "src/components/Sidebar/Sidebar";

const Layout = (props: LayoutProps): ReactElement => {
  return <Container maxWidth={false} style={{padding: '0'}}>
    <Header />
    <div>
      <SideBar>
        <div>Sidebar</div>
      </SideBar>
      <div>
        {props.children}
      </div>
    </div>
  </Container>
};

export default Layout;