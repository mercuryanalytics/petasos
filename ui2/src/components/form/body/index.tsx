import React, { useState } from "react"

import Tabs from "./tabs"
import ClientDetails from "./client_details"
import Accounts from "./accounts"

const Body: React.FC = () => {
  const [showClientDetails, setShowClientDetails] = useState("ClientDetails")

  return (
    <div className="FormBody">
      <Tabs setShowClientDetails={setShowClientDetails} />
      {showClientDetails === "ClientDetails" ? <ClientDetails /> : <Accounts />}
    </div>
  )
}

export default Body
