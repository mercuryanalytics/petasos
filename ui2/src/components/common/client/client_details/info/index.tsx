import React, { useState } from "react"
import { Input } from "react-aria-components"

import TextField from "../../../text_field/CustomTextField"

import { Picker, Item } from "../../../picker"

const ClientInfo: React.FC<{ name?: string }> = ({ name }) => {
  const [showDomain, setShowDomain] = useState(false)

  return (
    <>
      <TextField name="client name" isRequired label="Client name *" value={name ?? ""}>
        {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
      </TextField>
      <TextField name="company name" isRequired label="Company name *" value="N/A">
        {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
      </TextField>
      <Picker
        isRequired
        name="contact type"
        label="Type *"
        placeholder="Contact type..."
        onSelectionChange={key => {
          setShowDomain(key === "partner")
        }}
      >
        <Item id="client">Client</Item>
        <Item id="partner">Partner</Item>
        <Item id="other">Other</Item>
      </Picker>
      <TextField name="motto" label="Motto" value="N/A">
        {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
      </TextField>
      {showDomain && (
        <TextField name="subdomain" label="Subdomain" value="N/A">
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
      )}
    </>
  )
}

export default ClientInfo
