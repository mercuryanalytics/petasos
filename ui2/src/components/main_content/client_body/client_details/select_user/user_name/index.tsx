import React from "react"
import { Switch } from "react-aria-components"

import "./index.scss"

const UserName: React.FC<{ title: string }> = ({ title }) => (
  <div className="UserName">
    <Switch>
      {title}
      <div className="indicator" />
    </Switch>
  </div>
)

export default UserName
