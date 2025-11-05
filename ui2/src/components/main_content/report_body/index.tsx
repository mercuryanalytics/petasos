import React from "react"
import SelectUser from "../../common/select_user"

import ReportDetails from "./report_details"

import "./index.scss"

const ReportBody: React.FC = () => (
  <div className="ReportBody">
    <ReportDetails />
    <SelectUser name="Report (with Project & Client) View" />
  </div>
)

export default ReportBody
