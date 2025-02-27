import React from "react"
import Search from "./search"
import Menu from "./menu"

import "./index.scss"

const NavigationMenu: React.FC<{ showSideMenu: boolean }> = ({ showSideMenu }) => (
  <div className={`NavigationMenu${showSideMenu ? "" : " slide"}`}>
    <Search />
    <Menu />
  </div>
)

export default NavigationMenu
