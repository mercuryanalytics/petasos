import React from "react"
import SelectUser from "../../common/select_user"

import ProjectDetails from "./project_details"

import "./index.scss"

const ProjectBody: React.FC = () => (
  <div className="ProjectBody">
    <ProjectDetails />
    <SelectUser name="Project access" />
  </div>
)

export default ProjectBody
