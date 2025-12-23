import React, { useEffect, useState } from "react"
import { useAtomValue } from "jotai"
import * as atoms from "../../../atoms"

import { TextField, FieldError, Label, TextFieldProps } from "react-aria-components"

import "./index.scss"

type Props = {
  label: string
  value: string
  children: (
    value: string,
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  ) => React.ReactNode
  staticField?: boolean
} & Omit<TextFieldProps, "children">

const CustomTextField: React.FC<Props> = ({ label, value: defaultValue, staticField = true, ...props }) => {
  const input = useAtomValue(atoms.showInput)
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  return (
    <TextField {...props}>
      <Label>{label}</Label>
      {staticField || input
        ? props.children(value, event => {
            setValue(event.target.value)
          })
        : props.children(value)}
      <FieldError>
        {({ validationDetails }) => {
          if (validationDetails.typeMismatch && props.type === "email")
            return "Field value must be a valid email format."
          if (validationDetails.valueMissing) return "Field value is required."
        }}
      </FieldError>
    </TextField>
  )
}

export default CustomTextField
