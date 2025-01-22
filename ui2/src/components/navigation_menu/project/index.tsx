import React from "react"
import { atom } from "jotai"

import useDropdown from "../../../hooks/useDropdown"

import { ArrowRight, Folder } from "../../icons"

import Report from "../report"

import "./index.scss"

const rotateAtom = atom(0)
const showMenuAtom = atom(false)

const Project: React.FC = () => {
  const { rotate, showMenu: showReport, setShowDropdown } = useDropdown(rotateAtom, showMenuAtom)

  return (
    <ul className="Project">
      <li>
        <a href="#">
          <div>
            <span>+ Add new project</span>
          </div>
        </a>
      </li>
      <li>
        <a href="#" onClick={setShowDropdown}>
          <div>
            <ArrowRight rotate={rotate} />
          </div>
          <Folder />
          <span>Project Name</span>
        </a>
        {showReport && <Report />}
      </li>
    </ul>
  )
}

export default Project
