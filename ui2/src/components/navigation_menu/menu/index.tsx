import React from "react"
import SimpleBarReact from "simplebar-react"
import { useSetAtom } from "jotai"

import { UNSTABLE_Tree as Tree, UNSTABLE_TreeItem as TreeItem, Button } from "react-aria-components"

import items from "../../../../public/menuItems"

import { showInput } from "../../../atoms"

import { MenuItem } from "../../common/types"

import InsertItem from "./insert_item"
import Content from "./Content"

import "./index.scss"

const Menu: React.FC = () => {
  const setShowInput = useSetAtom(showInput)

  return (
    <SimpleBarReact style={{ height: "calc(100% - 59px)" }}>
      <div
        className="Menu"
        // FIXME: Check if the project name or number is same as the body of the clicked element then dont setshowInput to false
        onClickCapture={() => {
          setShowInput(false)
        }}
      >
        <Tree aria-label="Files" items={items}>
          {function renderItem({ type, title, reference, children }: MenuItem) {
            return (
              <TreeItem textValue={title}>
                <Content type={type} title={title} reference={reference} children={children} />
                {children.map((item, i) => {
                  const { type } = item
                  return (
                    <React.Fragment key={`${type}_${i}_child`}>
                      {i === 0 && (type === "projects" || type === "reports") && (
                        <InsertItem type={type} reference={reference} />
                      )}
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
    </SimpleBarReact>
  )
}

export default Menu
