// NOTE: Probably wont be needing this component in future for access and permissions in this project

import React from "react"

import {
  UNSTABLE_Tree as Tree,
  UNSTABLE_TreeItem as TreeItem,
  UNSTABLE_TreeItemContent as TreeItemContent,
  Button,
  Collection
} from "react-aria-components"

import items from "../../../../../../../../public/menuItems"

import { ArrowRight } from "../../../../../../icons"

import "./index.scss"

const Actions: React.FC = () => (
  <div className="Actions">
    <Tree aria-label="Files" selectionMode="multiple" items={items}>
      {function renderItem({ name, children }) {
        return (
          <TreeItem textValue={name}>
            <TreeItemContent>
              <div className={children.length ? "" : "Report"}>
                <div>
                  {children.length ? (
                    <Button slot="chevron">
                      <ArrowRight />
                    </Button>
                  ) : null}
                  <span>{name}</span>
                </div>
                <div>
                  {children.length ? <Button aria-label="Info">ⓘ</Button> : ""}
                  <Button aria-label="Info">ⓘ</Button>
                  <Button aria-label="Info">ⓘ</Button>
                  <Button aria-label="Info">ⓘ</Button>
                </div>
              </div>
            </TreeItemContent>
            <Collection items={children}>{renderItem}</Collection>
          </TreeItem>
        )
      }}
    </Tree>
  </div>
)

export default Actions
