import React from "react";
import Search from "./search";
import "./index.scss";
import ProjectMenu from "./project_menu";

const SideMenu: React.FC = () => {
  return (
    <div className="Side_Menu">
      <Search />
      <ProjectMenu />
    </div>
  );
};

export default SideMenu;
