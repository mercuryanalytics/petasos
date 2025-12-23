import React from "react"
import { useAtomValue } from "jotai"

import { showInput as showInputAtom } from "../../../../atoms"
import { ProjectDetailsForm } from "../../../common/form_components"

import ProjectDetailsHeader from "./header"
import ProjectDetailsFooter from "./footer"

import "./index.scss"

const ProjectDetails: React.FC = () => {
  const showInput = useAtomValue(showInputAtom)

  return (
    <div className="ProjectDetails">
      <ProjectDetailsHeader />
      <ProjectDetailsForm staticField={false} />
      {showInput && <ProjectDetailsFooter />}
    </div>
  )
}

export default ProjectDetails
