import React from "react"
import { useAtomValue } from "jotai"
import { I18nProvider } from "react-aria-components"

import { showInput as showInputAtom } from "../../../../../atoms"
import { Route } from "../../../../../routes/reports/$reportId"

import CustomTextField from "../../../../common/CustomTextField"
import DatePicker from "../../../../common/date_picker"

import "./index.scss"

const ReportDetailsForm: React.FC = () => {
  const showInput = useAtomValue(showInputAtom)
  const name = Route.useLoaderData()

  return (
    <form className="ReportDetailsForm">
      <CustomTextField label="Report name *" value={name} showInput={showInput} />
      {showInput && <CustomTextField label="URL" value="url" showInput={showInput} />}
      <CustomTextField label="Description" value="description" showInput={showInput} />
      {showInput ? (
        <>
          <I18nProvider locale="en-in">
            <DatePicker label="Last presented on" />
          </I18nProvider>
          <I18nProvider locale="en-in">
            <DatePicker isDisabled label="Last updated" />
          </I18nProvider>
        </>
      ) : (
        <>
          <CustomTextField label="Last presented on" value="N/A" showInput={showInput} />
          <CustomTextField label="Last updated" value="N/A" showInput={showInput} />
        </>
      )}
    </form>
  )
}

export default ReportDetailsForm
