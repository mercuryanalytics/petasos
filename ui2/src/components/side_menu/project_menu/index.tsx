import React, { useState } from "react"
import { ArrowRight, Folder } from "../../icons"
import { Button } from "react-aria-components"

import "./index.scss"

const ProjectMenu: React.FC = () => {
  const [rotate, setRotate] = useState(0)

  // TODO: Modify this method later using map index when using several list items
  const handleRotate = () => {
    if (rotate === 0) return setRotate(90)
    return setRotate(0)
  }

  return (
    <div className="Project-Menu">
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
          <ul>
            <li>
              <a href="#">
                <div>
                  <span>+ Add new project</span>
                </div>
              </a>
            </li>
            <li>
              <a href="#">
                <div>
                  <ArrowRight />
                </div>
                <Folder />
                <span>Project Name</span>
              </a>
            </li>
            <li>
              <a href="#">
                <div>
                  <ArrowRight />
                </div>
                <Folder />
                <span>Project Name</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
      <Button>
        <a href="#">+ Create New Client</a>
      </Button>
    </div>
  )
}

export default ProjectMenu
