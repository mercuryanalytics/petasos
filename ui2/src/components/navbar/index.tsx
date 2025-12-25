import React, { useState } from "react"
import { Menu, MenuItem, MenuTrigger, Popover, Button } from "react-aria-components"
import { useNavigate } from "@tanstack/react-router"
import { useSetAtom } from "jotai"

import { expandedKeys } from "../../atoms"

import * as Icons from "../icons"

import "./index.scss"
import "./react_menu_stylesheet.scss"

const Navbar: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { Back, Forward } = Icons
  const [showMenu, setShowMenu] = useState(true)
  const setExpandedKeys = useSetAtom(expandedKeys)
  const navigate = useNavigate()

  return (
    <div className="Navbar">
      <Button
        onPress={() => {
          setShowMenu(prev => !prev)
          onClick()
        }}
      >
        {showMenu ? <Back /> : <Forward />}
      </Button>
      <img
        onClick={() => {
          navigate({ to: "/" })
          setExpandedKeys([])
        }}
        src="/images/mercury_logo.png"
      />
      <div>
        <div>
          <div>
            <span>UL</span>
          </div>
          <span>User Name</span>
        </div>
        <div>
          <MenuTrigger>
            <Button aria-label="Menu">=</Button>
            <Popover>
              <Menu>
                <MenuItem>My account</MenuItem>
                <MenuItem>Log Out</MenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>
        </div>
      </div>
    </div>
  )
}

export default Navbar
