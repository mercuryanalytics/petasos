import React from "react"
import { Input, Label, SearchField, Tabs, TabList, Tab } from "react-aria-components"
import SimpleBarReact from "simplebar-react"

import { Trash } from "../../../../../icons"

import "./index.scss"
import range from "../../../../../../util/range"

const ModifyUser: React.FC = () => {
  return (
    <div className="ModifyUser">
      <div>
        <h1>User Template</h1>
      </div>
      <SearchField>
        <Label />
        <Input placeholder="Search" />
      </SearchField>
      <button>+ Add User</button>
      <SimpleBarReact style={{ height: "530px" }}>
        <Tabs>
          <TabList aria-label="Users List">
            {/* TODO: Change this later when using real data */}
            {Array.from(range(0, 20)).map((_, i) => (
              <Tab id={`name${i}`}>
                <span>name{i}</span> <Trash />
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </SimpleBarReact>
    </div>
  )
}

export default ModifyUser
