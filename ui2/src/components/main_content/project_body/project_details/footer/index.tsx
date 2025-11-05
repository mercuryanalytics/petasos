import React from "react"
import { useSetAtom } from "jotai"

import { showInput } from "../../../../../atoms"

import "./index.scss"

const ProjectDetailsFooter: React.FC = () => {
  const setShowInput = useSetAtom(showInput)

  return (
    <>
      {showInput && (
        <div className="ProjectDetailsFooter">
          <button>Update</button>
          <button onClick={() => setShowInput(false)}>Cancel</button>
        </div>
      )}
    </>
  )
}

export default ProjectDetailsFooter
