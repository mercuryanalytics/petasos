import React from "react";
import "./App.scss";
import Navbar from "./components/navbar";
import SideMenu from "./components/side_menu";

const App: React.FC = () => (
  <>
    <Navbar />
    <SideMenu />
  </>
);

export default App;
