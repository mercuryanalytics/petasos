import React, { useState } from "react"

import Tabs from "./tabs"
import ClientDetails from "./client_details"
import Accounts from "./accounts"

const ClientBody: React.FC = () => {
  const [showClientDetails, setShowClientDetails] = useState("ClientDetails")

  return (
    <div className="ClientBody">
      <Tabs setShowClientDetails={setShowClientDetails} />
      {showClientDetails === "ClientDetails" ? <ClientDetails /> : <Accounts />}
    </div>
  )
}

export default ClientBody
