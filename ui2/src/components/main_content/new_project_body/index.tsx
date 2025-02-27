import React from "react"

import { Button, FieldError, Input, Label, TextArea, TextField } from "react-aria-components"

import { Picker, Item } from "../../common/picker/"

import "./index.scss"

const NewProjectBody: React.FC = () => (
  <form className="NewProjectBody">
    <h1>Project details</h1>
    <TextField isRequired>
      <Label>Project name *</Label>
      <Input />
      <FieldError>
        {({ validationDetails }) => (validationDetails.valueMissing ? "Field value is required." : "")}
      </FieldError>
    </TextField>
    <TextField isRequired>
      <Label>Project #</Label>
      <Input />
    </TextField>
    <Picker label="Project type *" placeholder="Custom Research">
      <Item>Live Labs</Item>
      <Item>Brand Lift Research</Item>
      <Item>Custom Research</Item>
    </Picker>
    <TextField>
      <Label>Description</Label>
      <TextArea />
    </TextField>
    <Picker label="Research contact" placeholder="Select a research contact...">
      <Item>name1 (name1@gmail.com)</Item>
      <Item>name2 (name2@gmail.com)</Item>
    </Picker>
    <Button>Create</Button>
  </form>
)

export default NewProjectBody
