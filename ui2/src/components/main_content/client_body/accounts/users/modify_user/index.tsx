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
            {/* NOTE: Rendering 20 placeholder tabs with generated names. When API integration is added,
                replace Array.from(range(0, 20)) with the actual user list loaded via a TanStack Router
                loader. The loader data should be typed and accessed via useMatch() or useLoaderData(). */}
            {Array.from(range(0, 20)).map((t, i) => (
              <Tab key={t + i} id={`name${i}`}>
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
