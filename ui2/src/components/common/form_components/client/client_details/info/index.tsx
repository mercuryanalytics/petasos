import React, { useState } from "react"
import { Input } from "react-aria-components"
import { useMatch } from "@tanstack/react-router"

import { Route } from "../../../../../../routes/clients/$clientId"
import { EMPTY_VALUE } from "../../../../../../util/constants"

import TextField from "../../../../text_field"

import { Picker, Item } from "../../../../picker"

const ClientInfo: React.FC = () => {
  const [showDomain, setShowDomain] = useState(false)
  const data = useMatch({ from: Route.fullPath, shouldThrow: false })?.loaderData

  return (
    <>
      <TextField name="client name" isRequired label="Client name *" value={data?.name ?? ""}>
        {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
      </TextField>
      <TextField name="company name" isRequired label="Company name *" value={EMPTY_VALUE}>
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
      <TextField name="motto" label="Motto" value={EMPTY_VALUE}>
        {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
      </TextField>
      {showDomain && (
        <TextField name="subdomain" label="Subdomain" value={EMPTY_VALUE}>
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
      )}
    </>
  )
}

export default ClientInfo
