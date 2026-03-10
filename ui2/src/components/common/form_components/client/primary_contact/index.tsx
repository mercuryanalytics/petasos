import React from "react"
import TextField from "../../../text_field"
import { Input } from "react-aria-components"
import { EMPTY_VALUE } from "../../../../../util/constants"

const PrimaryContact: React.FC = () => (
  <div>
    <TextField name="name" isRequired label="Name *" value="name">
      {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
    </TextField>
    <TextField name="title" label="Title" value="title">
      {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
    </TextField>
    <TextField name="phone number" isRequired label="Phone number *" value={EMPTY_VALUE}>
      {(value, onChange) => <Input type="number" value={value} onChange={onChange} />}
    </TextField>
    <TextField name="fax number" label="Fax number" value={EMPTY_VALUE}>
      {(value, onChange) => <Input type="number" value={value} onChange={onChange} />}
    </TextField>
    <TextField name="email" isRequired label="Email *" type="email" value={EMPTY_VALUE}>
      {(value, onChange) => <Input type="email" value={value} onChange={onChange} />}
    </TextField>
  </div>
)

export default PrimaryContact
