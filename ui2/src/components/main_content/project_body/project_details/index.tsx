import React from "react"
import { useAtomValue } from "jotai"

import { showInput as showInputAtom } from "../../../../atoms"

import ProjectDetailsHeader from "./header"
import ProjectDetailsForm from "./form"
import ProjectDetailsFooter from "./footer"

import "./index.scss"

const ProjectDetails: React.FC = () => {
  const showInput = useAtomValue(showInputAtom)
  return (
    <div className="ProjectDetails">
      <ProjectDetailsHeader />
      <ProjectDetailsForm />
      {showInput && <ProjectDetailsFooter />}
    </div>
  )
}

export default ProjectDetails
