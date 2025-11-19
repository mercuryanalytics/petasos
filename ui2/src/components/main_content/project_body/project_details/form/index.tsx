import React from "react"
import { useAtomValue } from "jotai"
import { I18nProvider } from "react-aria-components"

import { showInput as showInputAtom } from "../../../../../atoms"
import { Route } from "../../../../../routes/projects/$projectId"

import CustomTextField from "../../../../common/CustomTextField"
import DatePicker from "../../../../common/date_picker"

import "./index.scss"

const ProjectDetailsForm: React.FC = () => {
  const showInput = useAtomValue(showInputAtom)
  const name = Route.useLoaderData()

  return (
    <form className="ProjectDetailsForm">
      <CustomTextField label="Project name" value={name} showInput={showInput} />
      <CustomTextField label="Project #" value="project" showInput={showInput} />
      <CustomTextField label="Project type" value="type" showInput={showInput} />
      <CustomTextField label="Description" value="description" showInput={showInput} />
      <CustomTextField label="Research contact" value="contact" showInput={showInput} />
      <CustomTextField label="Phone" value="202-386-6322 x 301" />
      <CustomTextField label="Email" value="email" />
      {showInput ? (
        <I18nProvider locale="en-in">
          <DatePicker label="Last presented on" />
        </I18nProvider>
      ) : (
        <CustomTextField label="Last updated" value="Thursday" showInput={showInput} />
      )}
    </form>
  )
}

export default ProjectDetailsForm
