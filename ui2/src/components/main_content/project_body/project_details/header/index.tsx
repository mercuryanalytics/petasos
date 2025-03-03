import React from "react"
import { Pen, Trash } from "../../../../icons"

import "./index.scss"

type Props = {
  showInput: boolean
  setShowInput: React.Dispatch<React.SetStateAction<boolean>>
}

const ProjectDetailsHeader: React.FC<Props> = ({ showInput, setShowInput }) => (
  <div className="ProjectDetailsHeader">
    <h1>Project details</h1>
    {!showInput && (
      <>
        <button>
          <Trash />
          <span>Delete project</span>
        </button>
        <button onClick={() => setShowInput(true)}>
          <Pen />
          <span>Edit</span>
        </button>
      </>
    )}
  </div>
)

export default ProjectDetailsHeader
