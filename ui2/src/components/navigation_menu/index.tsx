import React from "react"
import Search from "./search"
import "./index.scss"
// import Client from "./client"
import MenuStructure from "./menu_structure"

const NavigationMenu: React.FC<{ showSideMenu: boolean }> = ({ showSideMenu }) => {
  return (
    <div className={`Navigation-Menu${showSideMenu ? "" : " slide"}`}>
      <Search />
      <MenuStructure />
    </div>
  )
}

export default NavigationMenu
