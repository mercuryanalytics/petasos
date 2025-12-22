import React from "react"
import { Button } from "react-aria-components"

import "./index.scss"

const NewClientFooter: React.FC = () => (
  <div className="NewClientFooter">
    <Button type="submit">Continue</Button>
    <Button type="reset">Cancel</Button>
  </div>
)

export default NewClientFooter
