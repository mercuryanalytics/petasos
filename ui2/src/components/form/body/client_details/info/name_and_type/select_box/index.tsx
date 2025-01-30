import React from "react"
import { Button, Label, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components"
import { ArrowDown } from "../../../../../../icons"

import "./index.scss"

const Selectbox: React.FC = () => (
  <div>
    <Select>
      <Label>Partner Type</Label>
      <Button slot="chevron">
        <SelectValue>
          {({ defaultChildren, isPlaceholder }) => (isPlaceholder ? <span>Partner</span> : defaultChildren)}
        </SelectValue>
        <ArrowDown />
      </Button>
      <Popover>
        <ListBox>
          <ListBoxItem>Client</ListBoxItem>
          <ListBoxItem>Partner</ListBoxItem>
          <ListBoxItem>Other</ListBoxItem>
        </ListBox>
      </Popover>
    </Select>
  </div>
)

export default Selectbox
