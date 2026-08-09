import React, { useState } from "react"

import { Pen } from "../../../../../icons"

import AccountDetails from "./account_details"
import Contact from "./contact"

import "./index.scss"

const UserInfo: React.FC = () => {
  const [showInput, setShowInput] = useState(false)

  return (
    <form className="UserInfo">
      <div>
        <AccountDetails showInput={showInput} />
        <Contact showInput={showInput} />
      </div>
      {!showInput && (
        <button onClick={() => setShowInput(true)}>
          <h1>Edit</h1>
          <Pen />
        </button>
      )}
    </form>
  )
}

export default UserInfo
