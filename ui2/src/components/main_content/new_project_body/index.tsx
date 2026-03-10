import React from "react"

import { Button } from "react-aria-components"

import { ProjectDetailsForm } from "../../common/form_components"

import "./index.scss"

const NewProjectBody: React.FC = () => (
  <div className="NewProjectBody">
    <h1>Project details</h1>
    <ProjectDetailsForm />
    <Button>Create</Button>
  </div>
)

export default NewProjectBody
