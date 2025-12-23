import React from "react"
import TextField from "../../../text_field"
import { Input } from "react-aria-components"

const PrimaryContact: React.FC = () => (
  <div>
    <TextField name="name" isRequired label="Name *" value="name">
      {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
    </TextField>
    <TextField name="title" label="Title" value="title">
      {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
    </TextField>
    <TextField name="phone number" isRequired label="Phone number *" value="N/A">
      {(value, onChange) => <Input type="number" value={value} onChange={onChange} />}
    </TextField>
    <TextField name="fax number" label="Fax number" value="N/A">
      {(value, onChange) => <Input type="number" value={value} onChange={onChange} />}
    </TextField>
    <TextField name="email" isRequired label="Email *" type="email" value="N/A">
      {(value, onChange) => <Input type="email" value={value} onChange={onChange} />}
    </TextField>
  </div>
)

export default PrimaryContact
