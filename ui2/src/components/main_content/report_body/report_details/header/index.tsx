import React from "react"
import { useAtom } from "jotai"

import { showInput as showInputAtom } from "../../../../../atoms"

import { Pen, Trash } from "../../../../icons"

import "./index.scss"

const ReportDetailsHeader: React.FC = () => {
  const [showInput, setShowInput] = useAtom(showInputAtom)

  return (
    <div className="ReportDetailsHeader">
      <h1>Report details</h1>
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

export default ReportDetailsHeader
