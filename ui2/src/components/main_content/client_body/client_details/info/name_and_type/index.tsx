import React from "react"

import { Route } from "../../../../../../routes/clients/$clientId"
import { ClientDetails } from "../../../../../common/client"

import "./index.scss"

const NameAndType: React.FC = () => {
  const { name } = Route.useLoaderData()

  return (
    <div className="NameAndType">
      <h1>Name and type</h1>
      <ClientDetails name={name} />
    </div>
  )
}

export default NameAndType
