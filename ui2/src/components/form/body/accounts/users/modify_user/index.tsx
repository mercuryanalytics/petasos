import React from "react"
import { Input, Label, SearchField } from "react-aria-components"

import "./index.scss"

const ModifyUser: React.FC = () => {
  return (
    <div className="ModifyUser">
      <div>
        <h1>User Template</h1>
      </div>
      <SearchField>
        <Label />
        <Input placeholder="Search" />
      </SearchField>
    </div>
  )
}

export default ModifyUser
