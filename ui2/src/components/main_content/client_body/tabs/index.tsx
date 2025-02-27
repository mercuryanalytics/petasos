import React from "react"
import { Tab, Tabs, TabList } from "react-aria-components"

import "./index.scss"

const CustomTabs: React.FC<{ setShowClientDetails: React.Dispatch<React.SetStateAction<string>> }> = ({
  setShowClientDetails
}) => (
  <div className="CustomTabs">
    <Tabs onSelectionChange={selection => setShowClientDetails(String(selection))}>
      <TabList aria-label="Client Details">
        <Tab id="ClientDetails"> Client Details</Tab>
        <Tab id="Accounts">Accounts</Tab>
      </TabList>
    </Tabs>
  </div>
)

export default CustomTabs
