import React from "react"
import { Form } from "react-aria-components"

import Info from "./info"
import SelectUser from "./select_user"

import "./index.scss"

const ClientDetails: React.FC = () => (
  <Form className="ClientDetails">
    <Info />
    <SelectUser />
  </Form>
)

export default ClientDetails
