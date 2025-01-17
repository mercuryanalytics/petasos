import React from "react"
import Search from "./search"
import "./index.scss"
import Client from "./client"

const NavigationMenu: React.FC<{ showSideMenu: boolean }> = ({ showSideMenu }) => {
  return (
    <div className={`Navigation-Menu${showSideMenu ? "" : " slide"}`}>
      <Search />
      <Client />
    </div>
  )
}

export default NavigationMenu
