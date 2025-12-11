import React, { useState } from "react"

import TextField from "../../../../common/text_field/CustomTextField"
import { Item, Picker } from "../../../../common/picker"

import "./index.scss"

const NewClientInfo: React.FC = () => {
  const [showDomain, setShowDomain] = useState(false)

  return (
    <div className="NewClientInfo">
      <TextField name="client name" isRequired label="Client name *" />
      <TextField name="company name" isRequired label="Company name *" />
      <Picker
        isRequired
        name="contact type"
        label="Type"
        placeholder="Contact type..."
        onSelectionChange={key => {
          setShowDomain(key === "partner")
        }}
      >
        <Item id="client">Client</Item>
        <Item id="partner">Partner</Item>
        <Item id="other">Other</Item>
      </Picker>
      <TextField name="motto" isRequired label="Motto" />
      {showDomain && <TextField name="subdomain" isRequired label="Subdomain" />}
    </div>
  )
}

export default NewClientInfo
