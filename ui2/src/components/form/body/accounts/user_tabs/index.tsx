import React from "react"
import { Tabs, TabList, Tab } from "react-aria-components"

import "./index.scss"

type Props = {
  className?: string
  setShowUserTabs?: React.Dispatch<React.SetStateAction<string>>
  tab1: string
  tab2: string
}

const UserTabs: React.FC<Props> = ({ className, setShowUserTabs, tab1, tab2 }) => (
  <div className={"UserTabs" + " " + (className ?? "")}>
    <Tabs onSelectionChange={selection => setShowUserTabs && setShowUserTabs(String(selection))}>
      <TabList aria-label="user tabs">
        <Tab id={tab1.toLowerCase()}>{tab1}</Tab>
        <Tab id={tab2.toLowerCase()}>{tab2}</Tab>
      </TabList>
    </Tabs>
  </div>
)

export default UserTabs
