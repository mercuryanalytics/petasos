import React from "react"
import Search from "./search"
import "./index.scss"
// import Client from "./client"
import Menu from "./menu"

const NavigationMenu: React.FC<{ showSideMenu: boolean }> = ({ showSideMenu }) => (
  <div className={`NavigationMenu${showSideMenu ? "" : " slide"}`}>
    <Search />
    <Menu />
  </div>
)

export default NavigationMenu
