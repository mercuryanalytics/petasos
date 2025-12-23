import React from "react"

import { Button } from "react-aria-components"

import { ReportDetailsForm } from "../../common/form_components"

import "./index.scss"

const NewReportBody: React.FC = () => (
  <form className="NewReportBody">
    <h1>Report details</h1>
    <ReportDetailsForm />
    <Button>Create</Button>
  </form>
)

export default NewReportBody
