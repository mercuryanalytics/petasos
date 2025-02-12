import React from "react"
import { Tabs, TabList, Tab } from "react-aria-components"

import "./index.scss"

const AccountsTabs: React.FC = () => {
  return (
    <div className="AccountsTabs">
      <Tabs>
        <TabList aria-label="users and domains">
          <Tab id="users">Users</Tab>
          <Tab id="domains">Domains</Tab>
        </TabList>
      </Tabs>
    </div>
  )
}

export default AccountsTabs
