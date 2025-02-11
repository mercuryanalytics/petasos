import React from "react"
import { Tabs, TabList, Tab } from "react-aria-components"

import "./index.scss"

const Accounts: React.FC = () => {
  return (
    <div>
      <Tabs>
        <TabList aria-label="History of Ancient Rome">
          <Tab id="users">Users</Tab>
          <Tab id="domains">Domains</Tab>
        </TabList>
      </Tabs>
    </div>
  )
}

export default Accounts
