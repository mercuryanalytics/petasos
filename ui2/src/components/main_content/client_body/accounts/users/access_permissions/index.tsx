import React from "react"
import Overview from "./overview"

import "./index.scss"
import Actions from "./actions"

export const AccessPermissions: React.FC = () => {
  return (
    <div className="AccessPermissions">
      <Overview />
      <Actions />
    </div>
  )
}

export default AccessPermissions
