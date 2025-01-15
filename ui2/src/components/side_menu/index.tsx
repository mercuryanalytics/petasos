import React from "react";
import Search from "./Search";
import "./index.scss";
import "./react_search_stylesheet.scss";

const SideMenu: React.FC = () => {
  return (
    <div className="Side_Menu">
      <Search />
    </div>
  );
};

export default SideMenu;
