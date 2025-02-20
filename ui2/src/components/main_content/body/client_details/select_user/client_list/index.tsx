import React from "react"
import { Button } from "react-aria-components"
import { ArrowRight, TrailingDots } from "../../../../../icons"

import "./index.scss"

//TODO: Check if this component name needs to be changed in future

const ClientList: React.FC<{ title: string }> = ({ title }) => (
  <div className="ClientList">
    <Button slot="chevron">
      <ArrowRight />
    </Button>
    {title}
    <TrailingDots />
  </div>
)

export default ClientList
