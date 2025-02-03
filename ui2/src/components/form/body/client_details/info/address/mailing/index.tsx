import React from "react"
import { Input, Label, TextField } from "react-aria-components"

import "./index.scss"

const Mailing: React.FC = () => (
  <div className="Mailing">
    <h1>Mailing address</h1>
    <div>
      <TextField name="address line 1">
        <Label>Address Line 1 *</Label>
        <Input />
      </TextField>
      <TextField name="address line 2">
        <Label>Address Line 2</Label>
        <Input />
      </TextField>
      <TextField name="city">
        <Label>City *</Label>
        <Input />
      </TextField>
      <TextField name="state">
        <Label>State *</Label>
        <Input />
      </TextField>
      <TextField name="zip code">
        <Label>Zip code *</Label>
        <Input />
      </TextField>
      <TextField name="country">
        <Label>Country</Label>
        <Input />
      </TextField>
    </div>
  </div>
)

export default Mailing
