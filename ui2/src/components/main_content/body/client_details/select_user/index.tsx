import React from "react"
import {
  UNSTABLE_Tree as Tree,
  UNSTABLE_TreeItem as TreeItem,
  UNSTABLE_TreeItemContent as TreeItemContent,
  Collection,
  Input,
  Label,
  SearchField
} from "react-aria-components"

import items from "../../../../../../public/clientNames"
import UserName from "./user_name"

import ClientList from "./client_list"

import "./index.scss"

const SelectUser: React.FC = () => (
  <div className="SelectUser">
    <h1>Client Name</h1>
    <SearchField>
      <Label />
      <Input placeholder="Search" />
    </SearchField>
    <button>+ Add user</button>
    <Tree aria-label="Files" selectionMode="multiple" items={items}>
      {function renderItem({ title, children }) {
        return (
          <TreeItem textValue={title}>
            <TreeItemContent>
              {children.length ? <ClientList title={title} /> : <UserName title={title} />}
            </TreeItemContent>
            <Collection items={children}>{renderItem}</Collection>
          </TreeItem>
        )
      }}
    </Tree>
  </div>
)

export default SelectUser
