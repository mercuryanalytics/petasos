import React from "react"
import { ArrowRight, Folder } from "../../icons"

import "./index.scss"

const Project: React.FC = () => (
  <ul className="Project">
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
  </ul>
)

export default Project
