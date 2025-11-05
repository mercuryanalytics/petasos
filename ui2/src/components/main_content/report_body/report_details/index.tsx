import React from "react"
import { useAtomValue } from "jotai"

import { showInput as showInputAtom } from "../../../../atoms"

import ReportDetailsHeader from "./header"
import ReportDetailsForm from "./form"
import ReportDetailsFooter from "./footer"

import "./index.scss"

const ReportDetails: React.FC = () => {
  const showInput = useAtomValue(showInputAtom)
  return (
    <div className="ReportDetails">
      <ReportDetailsHeader />
      <ReportDetailsForm />
      {showInput && <ReportDetailsFooter />}
    </div>
  )
}

export default ReportDetails
