import React from "react"

import AccountDetails from "./account_details"
import Contact from "./contact"

import "./index.scss"

const UserInfo: React.FC = () => {
  return (
    <form className="UserInfo">
      <AccountDetails />
      <Contact />
    </form>
  )
}

export default UserInfo
