import React, { useState } from "react"
import { Menu, MenuItem, MenuTrigger, Popover, Button } from "react-aria-components"
import { useNavigate } from "@tanstack/react-router"
import { useSetAtom } from "jotai"

import * as atoms from "../../atoms"

import * as Icons from "../icons"
import { PLACEHOLDER_USER_INITIALS, PLACEHOLDER_USER_NAME } from "../../util/constants"

import "./index.scss"
import "./react_menu_stylesheet.scss"

const Navbar: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { Back, Forward } = Icons
  const [showMenu, setShowMenu] = useState(true)
  const setExpandedKeys = useSetAtom(atoms.expandedKeys)
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
          setExpandedKeys(new Set())
        }}
        src="/images/mercury_logo.png"
      />
      <div>
        <div>
          <div>
            <span>{PLACEHOLDER_USER_INITIALS}</span>
          </div>
          <span>{PLACEHOLDER_USER_NAME}</span>
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
