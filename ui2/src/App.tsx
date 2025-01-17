import React, { useState } from "react"
import "./App.scss"
import Navbar from "./components/navbar"
import NavigationMenu from "./components/navigation_menu"

const App: React.FC = () => {
  const [showSideMenu, setSideShowMenu] = useState(true)

  return (
    <>
      <Navbar onClick={() => setSideShowMenu(prev => !prev)} />
      <NavigationMenu showSideMenu={showSideMenu} />
    </>
  )
}

export default App
