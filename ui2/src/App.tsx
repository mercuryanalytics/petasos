import React, { PropsWithChildren, useEffect, useState } from "react"
import { useSetAtom } from "jotai"

import Navbar from "./components/navbar"
import NavigationMenu from "./components/navigation_menu"
import MainContent from "./components/main_content"

import { showSearch as search } from "./atoms"

import "./styles/react_aria_checkbox.scss"
import "./styles/react_aria_search_field.scss"
import "./styles/react_aria_switch.scss"
import "./styles/react_aria_tooltip.scss"
import "./styles/react_aria_text_field.scss"

import "./App.scss"

const App: React.FC<PropsWithChildren> = ({ children }) => {
  const [showSideMenu, setSideShowMenu] = useState(true)
  const setShowSearch = useSetAtom(search)

  useEffect(() => {
    const handleGlobalClickCapture = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const isInSearch = target?.closest(".SearchMenu, .SearchDropdown") != null

      setShowSearch(isInSearch)
    }

    document.addEventListener("click", handleGlobalClickCapture, true)
    return () => document.removeEventListener("click", handleGlobalClickCapture, true)
  }, [setShowSearch])

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
