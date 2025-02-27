import React from "react"
import { Input, Label, TextField } from "react-aria-components"
import { Picker, Item } from "../../../../../common/picker"

import "./index.scss"

const NameAndType: React.FC = () => (
  <div className="NameAndType">
    <h1>Name and Type</h1>
    <div>
      <TextField name="client name">
        <Label>Client name *</Label>
        <Input />
      </TextField>
      <TextField name="company name">
        <Label>Company name *</Label>
        <Input />
      </TextField>
      <Picker label="Partner type" placeholder="Partner">
        <Item>Client</Item>
        <Item>Partner</Item>
        <Item>Other</Item>
      </Picker>
    </div>
  </div>
)

export default NameAndType
