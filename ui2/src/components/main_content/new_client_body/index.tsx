import React from "react"
import CreateClient from "./create_client"
import Form from "./client_form"

import "./index.scss"

export const NewClientBody: React.FC = () => {
  return (
    <div className="NewClientBody">
      <CreateClient />
      <Form />
    </div>
  )
}

export default NewClientBody
