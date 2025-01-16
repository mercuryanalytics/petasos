import React, { useState } from "react";
import "./App.scss";
import Navbar from "./components/navbar";
import SideMenu from "./components/side_menu";

const App: React.FC = () => {
  const [showSideMenu, setSideShowMenu] = useState(true);

  return (
    <>
      <Navbar onClick={() => setSideShowMenu((prev) => !prev)} />
      <SideMenu showSideMenu={showSideMenu} />
    </>
  );
};

export default App;
