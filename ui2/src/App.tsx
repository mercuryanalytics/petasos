import React, { useState } from "react"
import Navbar from "./components/navbar"
import NavigationMenu from "./components/navigation_menu"
import Form from "./components/form"

import "./styles/react_aria_checkbox.scss"
import "./styles/react_aria_search_field.scss"
import "./styles/react_aria_switch.scss"
import "./styles/react_aria_tooltip.scss"

import "./App.scss"

const App: React.FC = () => {
  const [showSideMenu, setSideShowMenu] = useState(true)

  return (
    <>
      <Navbar onClick={() => setSideShowMenu(prev => !prev)} />
      <div>
        <NavigationMenu showSideMenu={showSideMenu} />
        <Form />
      </div>
    </>
  )
}

export default App
