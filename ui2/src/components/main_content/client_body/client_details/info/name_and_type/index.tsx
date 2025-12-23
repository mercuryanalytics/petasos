import React from "react"

import { ClientForm } from "../../../../../common/form_components/"

import "./index.scss"

const NameAndType: React.FC = () => {
  return (
    <div className="NameAndType">
      <h1>Name and type</h1>
      <ClientForm.ClientDetails />
    </div>
  )
}

export default NameAndType
