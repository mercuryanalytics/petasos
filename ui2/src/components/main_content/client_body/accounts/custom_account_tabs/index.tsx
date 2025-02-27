import React from "react"
import { Tabs, TabList, Tab } from "react-aria-components"

import "./index.scss"

type Props = {
  className?: string
  setShowUserTabs?: React.Dispatch<React.SetStateAction<string>>
  setShowUserInfo?: React.Dispatch<React.SetStateAction<string>>
  tab1: string
  tab2: string
}

const CustomAccountTabs: React.FC<Props> = ({ className, setShowUserTabs, setShowUserInfo, tab1, tab2 }) => (
  <div className={"UserTabs" + " " + (className ?? "")}>
    <Tabs
      onSelectionChange={selection => {
        if (setShowUserTabs) return setShowUserTabs(String(selection))
        if (setShowUserInfo) return setShowUserInfo(String(selection))
      }}
    >
      <TabList aria-label="user tabs">
        <Tab id={tab1.toLowerCase()}>{tab1}</Tab>
        <Tab id={tab2.toLowerCase()}>{tab2}</Tab>
      </TabList>
    </Tabs>
  </div>
)

export default CustomAccountTabs
