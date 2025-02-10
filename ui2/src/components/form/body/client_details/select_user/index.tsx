import React from "react"
import {
  UNSTABLE_Tree as Tree,
  UNSTABLE_TreeItem as TreeItem,
  UNSTABLE_TreeItemContent as TreeItemContent,
  Button,
  Collection,
  Input,
  Label,
  SearchField,
  Switch
} from "react-aria-components"

import items from "../../../../../../public/clientNames"

import { ArrowRight, TrailingDots } from "../../../../icons"

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
          <TreeItem
            textValue={title}
            className={"react-aria-TreeItem" + " " + `${children.length ? "Client" : "ClientName"}`}
          >
            <TreeItemContent>
              {children.length ? (
                <Button slot="chevron">
                  <ArrowRight />
                </Button>
              ) : null}
              {children.length ? (
                <>
                  {title}
                  <TrailingDots />
                </>
              ) : (
                <Switch>
                  {title}
                  <div className="indicator" />
                </Switch>
              )}
            </TreeItemContent>
            <Collection items={children}>{renderItem}</Collection>
          </TreeItem>
        )
      }}
    </Tree>
  </div>
)

export default SelectUser
