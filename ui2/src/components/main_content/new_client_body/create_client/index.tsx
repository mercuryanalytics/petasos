import React from "react"
import "./index.scss"

const CreateClient: React.FC = () => {
  return (
    <div className="CreateClient">
      <h1>Create new client </h1>
      <p>Follow the steps below in order to create a new client</p>
      <ol>
        <li>Client details</li>
        <li>Primary contact</li>
        <li>Addresses</li>
      </ol>
    </div>
  )
}

export default CreateClient
