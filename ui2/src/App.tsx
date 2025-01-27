import React, { useState } from "react"
import "./App.scss"
import Navbar from "./components/navbar"
import NavigationMenu from "./components/navigation_menu"
import Form from "./components/form"

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
