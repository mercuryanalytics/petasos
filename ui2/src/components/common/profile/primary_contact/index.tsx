import React from "react"
import TextField from "../../text_field/CustomTextField"

const PrimaryContact: React.FC = () => {
  return (
    <div>
      <TextField name="name" isRequired label="Name *" />
      <TextField name="title" label="Title" />
      <TextField name="phone number" isRequired label="Phone number *" />
      <TextField name="fax number" label="Fax number" />
      <TextField name="email" isRequired label="Email *" type="email" />
    </div>
  )
}

export default PrimaryContact
