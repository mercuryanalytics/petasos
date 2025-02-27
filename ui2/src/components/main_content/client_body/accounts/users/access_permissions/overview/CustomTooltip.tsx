import React from "react"
import {
  Button,
  OverlayArrow,
  Tooltip,
  TooltipProps,
  TooltipTrigger,
  TooltipTriggerComponentProps
} from "react-aria-components"

import { Info } from "../../../../../../icons"

type MyTooltipProps = {
  children: React.ReactNode
} & Omit<TooltipProps, "children"> &
  Omit<TooltipTriggerComponentProps, "children">

const CustomTooltip: React.FC<MyTooltipProps> = ({ children, ...props }) => (
  <TooltipTrigger {...props}>
    <Button>
      <Info />
    </Button>
    <Tooltip {...props}>
      <OverlayArrow>
        <svg width={8} height={8} viewBox="0 0 8 8">
          <path d="M0 0 L4 4 L8 0" />
        </svg>
      </OverlayArrow>
      {children}
    </Tooltip>
  </TooltipTrigger>
)

export default CustomTooltip
