import React from "react"
import Logo from "./logo"
import Info from "./info"

const ClientDetails: React.FC<{ name?: string }> = ({ name }) => {
  return (
    <div>
      <Logo />
      <Info name={name} />
    </div>
  )
}

export default ClientDetails
