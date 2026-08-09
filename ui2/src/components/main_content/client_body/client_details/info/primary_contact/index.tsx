import React from "react"
import "./index.scss"
import { ClientForm } from "../../../../../common/form_components/"

const PrimaryContact: React.FC = () => (
  <div className="PrimaryContact">
    <h1>Primary Contact</h1>
    <ClientForm.PrimaryContact />
  </div>
)

export default PrimaryContact
