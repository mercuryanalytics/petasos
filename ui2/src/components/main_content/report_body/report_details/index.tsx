import React from "react"
import { useAtomValue } from "jotai"

import { showInput as showInputAtom } from "../../../../atoms"

import { ReportDetailsForm } from "../../../common/form_components"

import ReportDetailsHeader from "./header"
import ReportDetailsFooter from "./footer"

import "./index.scss"

const ReportDetails: React.FC = () => {
  const showInput = useAtomValue(showInputAtom)
  return (
    <div className="ReportDetails">
      <ReportDetailsHeader />
      <ReportDetailsForm staticField={false} />
      {showInput && <ReportDetailsFooter />}
    </div>
  )
}

export default ReportDetails
