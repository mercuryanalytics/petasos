import React from "react";
import Search from "./search";
import "./index.scss";
import ProjectMenu from "./project_menu";

const SideMenu: React.FC<{ showSideMenu: boolean }> = ({ showSideMenu }) => {
  return (
    <div className={`Side_Menu${showSideMenu ? "" : " slide"}`}>
      <Search />
      <ProjectMenu />
    </div>
  );
};

export default SideMenu;
