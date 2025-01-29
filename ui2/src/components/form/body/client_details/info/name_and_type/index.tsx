import React from "react"
import { Input, Label, TextField } from "react-aria-components"
import Selectbox from "./select_box/Selectbox"

import "./index.scss"

const NameAndType: React.FC = () => (
  <div className="Name-And-Type">
    <div>
      <span>Name and Type</span>
    </div>
    <div>
      <div>
        <TextField name="name">
          <Label>Name</Label>
          <Input />
        </TextField>
      </div>
      <div>
        <TextField name="name">
          <Label>Name</Label>
          <Input />
        </TextField>
      </div>
      <Selectbox />
    </div>
  </div>
)

export default NameAndType
