import React, { useState } from "react"
import { Button } from "react-aria-components"
import { ArrowRight } from "../../icons"

import Project from "../project"

import "./index.scss"

const Client: React.FC = () => {
  const [rotate, setRotate] = useState(0)
  const [showDropDown, setShowDropdown] = useState(false)

  // TODO: Modify this method later using map index when using several list items
  const handleRotate = () => {
    setShowDropdown(prev => !prev)
    if (rotate === 0) {
      setRotate(90)
    } else {
      setRotate(0)
    }
  }

  return (
    <div className="Client">
      <ul>
        <li>
          <a href="#" onClick={handleRotate}>
            <div>
              <ArrowRight rotate={rotate} />
            </div>
            <div>
              <img src="images/mercury_logo.png" alt="" />
            </div>
            <span>Ascention</span>
          </a>
          {showDropDown && <Project />}
        </li>
      </ul>
      <Button>
        <a href="#">+ Create New Client</a>
      </Button>
    </div>
  )
}

export default Client
