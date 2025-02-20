import React from "react"
import SimpleBarReact from "simplebar-react"

import NameAndType from "./name_and_type"
import ClientLogo from "./client_logo"
import PrimaryContact from "./primary_contact"
import Address from "./address"

import "simplebar-react/dist/simplebar.min.css"
import "./index.scss"

export const Info: React.FC = () => (
  <div className="Info">
    <SimpleBarReact style={{ height: "728px" }}>
      <div>
        <NameAndType />
        <ClientLogo />
        <PrimaryContact />
        <Address />
      </div>
    </SimpleBarReact>
  </div>
)

export default Info
