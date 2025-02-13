import React from "react"

import { Input, TextField } from "react-aria-components"

import "./index.scss"

const AccountDetails: React.FC<{ showInput: boolean }> = ({ showInput }) => (
  <div className="AccountDetails">
    <h1>Account details</h1>
    <div>
      <label>{"Account name " + (showInput ? "*" : "")}</label>
      {showInput ? (
        <TextField isDisabled>
          <Input value="account@gmail.com" />
        </TextField>
      ) : (
        <span>account@gmail.com</span>
      )}
    </div>
    <div>
      <label>{"Last login " + (showInput ? "*" : "")}</label>
      <span>-</span>
    </div>
  </div>
)

export default AccountDetails
