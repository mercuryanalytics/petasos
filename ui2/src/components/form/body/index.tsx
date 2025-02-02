import React from "react"

import Tabs from "./tabs"
import ClientDetails from "./client_details"

const Body: React.FC = () => (
  <div className="FormBody">
    <Tabs />
    <ClientDetails />
  </div>
)

export default Body
