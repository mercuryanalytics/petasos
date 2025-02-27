import React, { PropsWithChildren } from "react"
import {
  Button,
  FieldError,
  Key,
  Label,
  ListBox,
  Popover,
  Select,
  SelectProps,
  SelectValue
} from "react-aria-components"

import { ArrowDown } from "../../icons"

import "./index.scss"

type Props = Omit<SelectProps, "children"> & {
  label: string
  items?: Iterable<object[]>
  placeholder?: string
  errorMessage?: string
  onSelectionChange?: ((key: Key) => void) | undefined
} & PropsWithChildren

const Picker: React.FC<Props> = ({ label, children, items, placeholder, errorMessage, ...props }) => (
  <Select {...props}>
    <Label>{label}</Label>
    <Button slot="chevron">
      <SelectValue>
        {({ defaultChildren, isPlaceholder }) =>
          isPlaceholder && placeholder ? <span>{placeholder}</span> : defaultChildren
        }
      </SelectValue>
      <ArrowDown />
    </Button>
    <FieldError>
      {({ validationDetails }) => (validationDetails.valueMissing && errorMessage ? errorMessage : "")}
    </FieldError>
    <Popover>
      <ListBox items={items}>{children}</ListBox>
    </Popover>
  </Select>
)

export default Picker
