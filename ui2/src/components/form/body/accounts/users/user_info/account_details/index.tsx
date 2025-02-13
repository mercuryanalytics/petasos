import React from "react"

import "./index.scss"

const AccountDetails: React.FC = () => (
  <div className="AccountDetails">
    <h1>Account details</h1>
    <div>
      <label>Account name</label>
      <span>account@gmail.com</span>
    </div>
    <div>
      <label>Last login</label>
      <span>-</span>
    </div>
  </div>
)

export default AccountDetails
