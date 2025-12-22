import React from "react"

import Info from "./info"
import SelectUser from "../../../common/select_user"

import "./index.scss"

const ClientDetails: React.FC = () => (
  <div className="ClientDetails">
    <Info />
    <SelectUser />
  </div>
)

export default ClientDetails
