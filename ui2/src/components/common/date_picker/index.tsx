import React from "react"
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker as DatePick,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Label,
  Popover
} from "react-aria-components"

import { CalendarSymbol } from "../../icons"

import "./index.scss"

const formatDate = (date: string, value: number | undefined) => {
  if (value == null) return
  const currentDate = new Date()

  switch (date) {
    case "day":
      currentDate.setDate(value)
      return " " + currentDate.toLocaleDateString("default", { weekday: "long" }) + " " + value + ", "
    case "month":
      currentDate.setMonth(value - 1)
      return currentDate.toLocaleDateString("default", { month: "long" }) + ","
    case "year":
      return " " + value
    default:
      return null
  }
}

const DatePicker: React.FC<{ label: string }> = ({ label }) => (
  <DatePick>
    <Label>{label}</Label>
    <Group>
      <DateInput>
        {segment => (
          <DateSegment segment={segment}>
            {({ isPlaceholder, type, value }) => <pre>{isPlaceholder ? "" : formatDate(type, value)}</pre>}
          </DateSegment>
        )}
      </DateInput>
      <Button data-pressed="true">
        <CalendarSymbol />
      </Button>
    </Group>
    <Popover>
      <Dialog>
        <Calendar>
          <header>
            <Button slot="previous">◀</Button>
            <Heading />
            <Button slot="next">▶</Button>
          </header>
          <CalendarGrid>{date => <CalendarCell date={date} />}</CalendarGrid>
        </Calendar>
      </Dialog>
    </Popover>
  </DatePick>
)

export default DatePicker
