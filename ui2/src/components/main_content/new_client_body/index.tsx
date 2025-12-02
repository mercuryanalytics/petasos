import React from "react"
import CreateClient from "./create_client"
import NewClientDetails from "./new_client_details"

import "./index.scss"

export const NewClientBody: React.FC = () => {
  return (
    <div className="NewClientBody">
      <CreateClient />
      <NewClientDetails />
    </div>
  )
}

export default NewClientBody
