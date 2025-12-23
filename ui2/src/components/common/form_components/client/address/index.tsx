import React from "react"

import CustomAddress from "./CustomAddress"

import "./index.scss"

const Address: React.FC = () => (
  <div className="Address">
    <CustomAddress addressType="Mailing" />
    <CustomAddress alternateAddress addressType="Billing" />
  </div>
)

export default Address
