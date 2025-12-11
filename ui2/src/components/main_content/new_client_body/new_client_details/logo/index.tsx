import React from "react"
import { Upload } from "../../../../icons"
import "./index.scss"

const NewClientLogo: React.FC = () => (
  <div className="NewClientLogo">
    <h1>Client logo</h1>
    <div>
      <Upload />
    </div>
  </div>
)

export default NewClientLogo
