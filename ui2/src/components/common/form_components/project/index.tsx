import React from "react"
import { useAtomValue } from "jotai"
import { Input, TextArea } from "react-aria-components"
import { useMatch } from "@tanstack/react-router"

import { showInput as input } from "../../../../atoms"

import { Item, Picker } from "../../picker"

import TextField from "../../text_field"
import DatePicker from "../../date_picker"
import { Route } from "../../../../routes/projects/$projectId"
import { EMPTY_VALUE } from "../../../../util/constants"

import "./index.scss"

const ProjectDetailsForm: React.FC<{ staticField?: boolean }> = ({ staticField }) => {
  const showInput = useAtomValue(input)
  const data = useMatch({ from: Route.fullPath, shouldThrow: false })?.loaderData

  return (
    // NOTE: All text inputs are currently hardcoded as type="text". Once the data model is defined,
    // inspect each field's type and render the appropriate input: type="number" for numeric fields,
    // type="date" for dates (or use the existing DatePicker component), type="email" for emails, etc.
    // The Picker component already handles enum/select fields. This applies to ProjectDetailsForm,
    // ReportDetailsForm, and the client form components.
    <form className="ProjectDetailsForm">
      <TextField label="Project name" value={data?.name ?? ""} {...(staticField != null && { staticField })}>
        {(value, onChange) =>
          onChange ? <Input type="text" value={value} onChange={onChange} /> : <span>{value}</span>
        }
      </TextField>
      <TextField label="Project #" value={EMPTY_VALUE} {...(staticField != null && { staticField })}>
        {(value, onChange) =>
          onChange ? <Input type="text" value={value} onChange={onChange} /> : <span>{value}</span>
        }
      </TextField>
      <TextField label="Project type" value={EMPTY_VALUE} {...(staticField != null && { staticField })}>
        {(value, onChange) =>
          onChange ? <Input type="text" value={value} onChange={onChange} /> : <span>{value}</span>
        }
      </TextField>
      <TextField label="Description" value={EMPTY_VALUE} {...(staticField != null && { staticField })}>
        {(value, onChange) => (onChange ? <TextArea value={value} onChange={onChange} /> : <span>{value}</span>)}
      </TextField>
      {showInput ? (
        <>
          <Picker label="Research contact" placeholder="Select a research contact...">
            <Item>name1 (name1@gmail.com)</Item>
            <Item>name2 (name2@gmail.com)</Item>
          </Picker>
          <DatePicker label="Last updated" />
        </>
      ) : (
        <>
          <TextField label="Research contact" value={EMPTY_VALUE} {...(staticField != null && { staticField })}>
            {(value, onChange) =>
              onChange ? <Input type="text" value={value} onChange={onChange} /> : <span>{value}</span>
            }
          </TextField>
          {staticField && <DatePicker label="Last updated" />}
        </>
      )}
    </form>
  )
}

export default ProjectDetailsForm
