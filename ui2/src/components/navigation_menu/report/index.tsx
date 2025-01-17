import React from "react"
import { ArrowRight, File } from "../../icons"

const Report: React.FC = () => {
  return (
    <ul>
      <li>
        <a href="#">
          <div>
            <span>+ Add new report</span>
          </div>
        </a>
      </li>
      <li>
        <a href="#">
          <div>
            <ArrowRight />
          </div>
          <File />
          <span>Project Name</span>
        </a>
      </li>
    </ul>
  )
}

export default Report
