import React from "react"

import "./index.scss"

const ProjectDetailsFooter: React.FC<{ setShowInput: React.Dispatch<React.SetStateAction<boolean>> }> = ({
  setShowInput
}) => (
  <div className="ProjectDetailsFooter">
    <button>Update</button>
    <button onClick={() => setShowInput(false)}>Cancel</button>
  </div>
)

export default ProjectDetailsFooter
