import React from "react"
import { useAtom } from "jotai"

import { showInput as showInputAtom } from "../../../../../atoms"

import { Pen, Trash } from "../../../../icons"

import "./index.scss"

const ProjectDetailsHeader: React.FC = () => {
  const [showInput, setShowInput] = useAtom(showInputAtom)

  return (
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
}

export default ProjectDetailsHeader
