import React from "react"
import { useAtomValue } from "jotai"
import { Input, TextArea } from "react-aria-components"
import { useMatch } from "@tanstack/react-router"

import { Route } from "../../../../routes/reports/$reportId"
import { showInput as showInputAtom } from "../../../../atoms"
import { EMPTY_VALUE } from "../../../../util/constants"

import TextField from "../../text_field"
import DatePicker from "../../date_picker"

import "./index.scss"

const ReportDetailsForm: React.FC<{ staticField?: boolean }> = ({ staticField }) => {
  const showInput = useAtomValue(showInputAtom)
  const data = useMatch({ from: Route.fullPath, shouldThrow: false })?.loaderData

  return (
    <form className="ReportDetailsForm">
      <TextField label="Report name *" value={data?.name ?? ""} staticField={staticField}>
        {(value, onChange) =>
          onChange ? <Input type="text" value={value} onChange={onChange} /> : <span>{value}</span>
        }
      </TextField>
      {showInput && (
        <TextField label="URL" defaultValue="url" value={EMPTY_VALUE} staticField={staticField}>
          {(value, onChange) =>
            onChange ? <Input type="text" value={value} onChange={onChange} /> : <span>{value}</span>
          }
        </TextField>
      )}
      <TextField label="Description" defaultValue="description" value={EMPTY_VALUE} staticField={staticField}>
        {(value, onChange) => (onChange ? <TextArea value={value} onChange={onChange} /> : <span>{value}</span>)}
      </TextField>
      {showInput || staticField == null ? (
        <>
          <DatePicker label="Last presented on" />
          <DatePicker isDisabled label="Last updated" />
        </>
      ) : (
        <>
          <TextField label="Last presented on" defaultValue={EMPTY_VALUE} value={EMPTY_VALUE}>
            {value => <span>{value}</span>}
          </TextField>
          <TextField label="Last updated" defaultValue={EMPTY_VALUE} value={EMPTY_VALUE}>
            {value => <span>{value}</span>}
          </TextField>
        </>
      )}
    </form>
  )
}

export default ReportDetailsForm
