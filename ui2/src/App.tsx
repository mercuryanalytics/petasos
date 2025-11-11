import React, { PropsWithChildren, useState } from "react"

import Navbar from "./components/navbar"
import NavigationMenu from "./components/navigation_menu"
import MainContent from "./components/main_content"

import "./styles/react_aria_checkbox.scss"
import "./styles/react_aria_search_field.scss"
import "./styles/react_aria_switch.scss"
import "./styles/react_aria_tooltip.scss"
import "./styles/react_aria_text_field.scss"

import "./App.scss"

const App: React.FC<PropsWithChildren> = ({ children }) => {
  const [showSideMenu, setSideShowMenu] = useState(true)

  return (
    <>
      <Navbar onClick={() => setSideShowMenu(prev => !prev)} />
      <div>
        <NavigationMenu showSideMenu={showSideMenu} />
        <MainContent>{children}</MainContent>
      </div>
    </>
  )
}

export default App
