import React from "react"
import { Tab, Tabs, TabList } from "react-aria-components"

import "./index.scss"

const CustomTabs: React.FC = () => (
  <div className="Custom-Tabs">
    <Tabs>
      <TabList aria-label="Client Details">
        <Tab id="Client-Details"> Client Details</Tab>
        <Tab id="Accounts">Accounts</Tab>
      </TabList>
    </Tabs>
  </div>
)

export default CustomTabs
