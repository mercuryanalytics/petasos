import React from "react"
import { Input, Label, TextField } from "react-aria-components"

import "./index.scss"

const PrimaryContact: React.FC = () => (
  <div className="PrimaryContact">
    <h1>Primary Contact</h1>
    <div>
      <TextField name="name">
        <Label>Name *</Label>
        <Input />
      </TextField>
      <TextField name="title">
        <Label>Title</Label>
        <Input />
      </TextField>
      <TextField name="phone number">
        <Label>Phone number *</Label>
        <Input />
      </TextField>
      <TextField name="fax number">
        <Label>Fax number</Label>
        <Input />
      </TextField>
      <TextField name="email">
        <Label>Email *</Label>
        <Input />
      </TextField>
    </div>
  </div>
)

export default PrimaryContact
