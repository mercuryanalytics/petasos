import React from "react"
import { Button } from "react-aria-components"

import { atom } from "jotai"

import useDropdown from "../../../hooks/useDropdown"
import { ArrowRight } from "../../icons"

import Project from "../project"

import "./index.scss"

const rotateAtom = atom(0)
const showMenuAtom = atom(false)

const Client: React.FC = () => {
  const { rotate, showMenu: showProject, setShowDropdown } = useDropdown(rotateAtom, showMenuAtom)

  return (
    <div className="Client">
      <ul>
        <li>
          <a href="#" onClick={setShowDropdown}>
            <div>
              <ArrowRight rotate={rotate} />
            </div>
            <div>
              <img src="images/mercury_logo.png" alt="" />
            </div>
            <span>Ascention</span>
          </a>
          {showProject && <Project />}
        </li>
      </ul>
      <Button>
        <a href="#">+ Create New Client</a>
      </Button>
    </div>
  )
}

export default Client
