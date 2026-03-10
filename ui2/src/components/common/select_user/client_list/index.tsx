import React from "react"
import { Button } from "react-aria-components"
import { ArrowRight, TrailingDots } from "../../../icons"

import "./index.scss"

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
