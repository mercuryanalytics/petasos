import React, { useState } from "react"
import { Button } from "react-aria-components"

import "./index.scss"
import Back from "../icons/Back"

const Navbar: React.FC = () => {
  const [showDropdown, setShowDropDown] = useState(false)

  const handleClick = () => {
    setShowDropDown(!showDropdown)
  }

  return (
    <div className="navbar">
      <Button>
        <Back />
      </Button>
      <img src="../../public/images/mercury_logo.png" />
      <div>
        <span>User Name</span>
        <button onClick={handleClick}>
          <span>^</span>
        </button>
        <div>
          <ul style={showDropdown ? { display: "block" } : { display: "none" }}>
            <li>My account</li>
            <li>Log Out</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar
