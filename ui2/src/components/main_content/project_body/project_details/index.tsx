import React, { useState } from "react"

import ProjectDetailsHeader from "./header"
import ProjectDetailsForm from "./form"
import ProjectDetailsFooter from "./footer"

import "./index.scss"

// Note: This is a temporary data until real one is used

const ProjectDetails: React.FC = () => {
  const [showInput, setShowInput] = useState(false)

  return (
    <div className="ProjectDetails">
      <ProjectDetailsHeader showInput={showInput} setShowInput={setShowInput} />
      <ProjectDetailsForm showInput={showInput} />
      {showInput && <ProjectDetailsFooter setShowInput={setShowInput} />}
    </div>
  )
}

export default ProjectDetails
