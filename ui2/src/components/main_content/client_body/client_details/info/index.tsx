import React from "react"
import SimpleBarReact from "simplebar-react"
import { Button } from "react-aria-components"

import { ClientForm } from "../../../../common/form_components/"

import NameAndType from "./name_and_type"
import PrimaryContact from "./primary_contact"

import "simplebar-react/dist/simplebar.min.css"
import "./index.scss"

export const Info: React.FC = () => (
  <form className="Info">
    <SimpleBarReact style={{ height: "728px" }}>
      <NameAndType />
      <PrimaryContact />
      <ClientForm.Address />
      <Button type="submit">Update</Button>
    </SimpleBarReact>
  </form>
)

export default Info
