import React from "react"

import { UNSTABLE_Tree as Tree, UNSTABLE_TreeItem as TreeItem, Button } from "react-aria-components"

import items from "../../../../public/menuItems"

import InsertItem from "./insert_item"
import Content from "./Content"

import "./index.scss"

const Menu: React.FC = () => {
  return (
    <div className="Menu">
      <Tree aria-label="Files" selectionMode="multiple" items={items}>
        {function renderItem({ title, children }) {
          return (
            <TreeItem textValue={title}>
              <Content title={title} children={children} />
              {children.map((item, i) => {
                const { title } = item
                return (
                  <React.Fragment key={`${title}_${i}_child`}>
                    {i === 0 && (title === "Project" || title === "Report") && <InsertItem title={title} />}
                    {renderItem(item)}
                  </React.Fragment>
                )
              })}
            </TreeItem>
          )
        }}
      </Tree>
      <Button>
        <a href="#">+ Create New Client</a>
      </Button>
    </div>
  )
}

export default Menu
