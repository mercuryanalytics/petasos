import React from "react"
import { Button, FieldError, I18nProvider, Input, Label, TextArea, TextField } from "react-aria-components"

import DatePicker from "../../../common/date_picker"

const ReportDetails: React.FC = () => (
  <div className="ReportDetails">
    <form className="NewReportBody">
      <h1>Report details</h1>
      <TextField isRequired>
        <Label>Report name *</Label>
        <Input />
        <FieldError>
          {({ validationDetails }) => (validationDetails.valueMissing ? "Field value is required." : "")}
        </FieldError>
      </TextField>
      <TextField isRequired>
        <Label>URL</Label>
        <Input />
      </TextField>
      <TextField>
        <Label>Description</Label>
        <TextArea />
      </TextField>
      <I18nProvider locale="en-in">
        <DatePicker label="Last presented on" />
      </I18nProvider>
      <I18nProvider locale="en-in">
        <DatePicker isDisabled label="Last updated" />
      </I18nProvider>
      <Button>Create</Button>
    </form>
  </div>
)

export default ReportDetails
