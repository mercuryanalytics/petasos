import React from "react"
import AccountsTabs from "./tabs"

import "./index.scss"
import Users from "./users"

const Accounts: React.FC = () => {
  return (
    <div className="Accounts">
      <AccountsTabs />
      <Users />
    </div>
  )
}

export default Accounts
