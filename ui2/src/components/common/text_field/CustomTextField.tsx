import React from "react"
import {
  TextField,
  FieldError,
  Input,
  InputProps,
  Label,
  TextArea,
  TextAreaProps,
  TextFieldProps
} from "react-aria-components"

import "./stylesheet.scss"

type Props = { label: string; value?: string; showInput?: boolean; tagName?: "input" | "textarea" } & TextFieldProps &
  InputProps &
  TextAreaProps

const CustomTextField: React.FC<Props> = ({ label, showInput = false, tagName = "input", ...props }) => (
  <TextField {...props}>
    <Label>{label}</Label>
    {showInput ? (
      tagName === "input" ? (
        <Input {...props} />
      ) : (
        <TextArea {...props} />
      )
    ) : (
      <span>{props.defaultValue}</span>
    )}
    <FieldError>
      {({ validationDetails }) => {
        if (validationDetails.typeMismatch && props.type === "email") return "Field value must be a valid email format."
        if (validationDetails.valueMissing) return "Field value is required."
      }}
    </FieldError>
  </TextField>
)

export default CustomTextField
