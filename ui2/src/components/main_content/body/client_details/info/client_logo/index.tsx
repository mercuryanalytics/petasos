import React from "react"
import { Input, Label, TextField } from "react-aria-components"

import "./index.scss"

const ClientLogo: React.FC = () => (
  <div className="ClientLogo">
    <div>
      <h1>Client Logo</h1>
      <img src="./images/mercury_logo.png" />
    </div>
    <TextField name="motto">
      <Label>Motto</Label>
      <Input />
    </TextField>
    <TextField name="subdomain">
      <Label>Subdomain</Label>
      <Input />
    </TextField>
  </div>
)

export default ClientLogo
