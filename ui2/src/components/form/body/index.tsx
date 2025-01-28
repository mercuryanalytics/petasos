import React from "react"

import Tabs from "./tabs"
import ClientDetails from "./client_details"

const Body: React.FC = () => (
  <div className="Form-Body">
    <Tabs />
    <ClientDetails />
  </div>
)

export default Body
