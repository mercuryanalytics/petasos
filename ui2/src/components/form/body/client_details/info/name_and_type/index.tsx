import React from "react"
import { Input, Label, TextField } from "react-aria-components"
import Selectbox from "./select_box"

import "./index.scss"

const NameAndType: React.FC = () => (
  <div className="Name-And-Type">
    <h1>Name and Type</h1>
    <div>
      <TextField name="name">
        <Label>Name</Label>
        <Input />
      </TextField>
      <TextField name="name">
        <Label>Name</Label>
        <Input />
      </TextField>
      <Selectbox />
    </div>
  </div>
)

export default NameAndType
