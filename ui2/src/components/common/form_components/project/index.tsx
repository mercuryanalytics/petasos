import React from "react"
import { useAtomValue } from "jotai"
import { Input, TextArea } from "react-aria-components"
import { useMatch } from "@tanstack/react-router"

import { showInput as input } from "../../../../atoms"

import { Item, Picker } from "../../picker"

import TextField from "../../text_field"
import DatePicker from "../../date_picker"
import { Route } from "../../../../routes/projects/$projectId"

import "./index.scss"

const ProjectDetailsForm: React.FC<{ staticField?: boolean }> = ({ staticField }) => {
  const showInput = useAtomValue(input)
  const data = useMatch({ from: Route.fullPath, shouldThrow: false })?.loaderData

  return (
    // FIXME: Whenever we get the overall data change the input field to the correct type. Eg: if value is of type number so input type should be of number and also add further states
    <form className="ProjectDetailsForm">
      <TextField label="Project name" value={data?.name ?? ""} {...(staticField != null && { staticField })}>
        {(value, onChange) =>
          onChange ? <Input type="text" value={value} onChange={onChange} /> : <span>{value}</span>
        }
      </TextField>
      <TextField label="Project #" value="N/A" {...(staticField != null && { staticField })}>
        {(value, onChange) =>
          onChange ? <Input type="text" value={value} onChange={onChange} /> : <span>{value}</span>
        }
      </TextField>
      <TextField label="Project type" value="N/A" {...(staticField != null && { staticField })}>
        {(value, onChange) =>
          onChange ? <Input type="text" value={value} onChange={onChange} /> : <span>{value}</span>
        }
      </TextField>
      <TextField label="Description" value="N/A" {...(staticField != null && { staticField })}>
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
          <TextField label="Research contact" value="N/A" {...(staticField != null && { staticField })}>
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
