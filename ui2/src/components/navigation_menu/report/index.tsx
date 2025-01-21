import React from "react"
import { File } from "../../icons"

import "./index.scss"

const Report: React.FC = () => {
  return (
    <ul className="Report">
      <li>
        <a href="#">
          <div>
            <span>+ Add new report</span>
          </div>
        </a>
      </li>
      <li>
        <a href="#">
          <File />
          <span>Report Name</span>
        </a>
      </li>
    </ul>
  )
}

export default Report
