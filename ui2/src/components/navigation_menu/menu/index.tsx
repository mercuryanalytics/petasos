import React from "react"
import SimpleBarReact from "simplebar-react"
import { useAtomValue, useSetAtom } from "jotai"

import { UNSTABLE_Tree as Tree, UNSTABLE_TreeItem as TreeItem, Button } from "react-aria-components"

import { clients } from "../../../util/records"

import * as atoms from "../../../atoms"

import { MenuItem } from "../../common/types"

import InsertItem from "./insert_item"
import Content from "./Content"

import "./index.scss"

const Menu: React.FC = () => {
  const setShowInput = useSetAtom(atoms.showInput)
  const hideClients = useAtomValue(atoms.hideClients)
  const menuItems = useAtomValue(atoms.menuItems)

  const searchRecords = menuItems ?? clients
  const records = searchRecords?.flatMap(item => (hideClients ? item.children : item))

  return (
    <SimpleBarReact style={{ height: "calc(100% - 59px)" }}>
      <div
        className="Menu"
        // FIXME: Check if the project name or number is same as the body of the clicked element then dont setshowInput to false
        onClickCapture={() => {
          setShowInput(false)
        }}
      >
        <Tree aria-label="Files" items={records}>
          {function renderItem({ type, name, reference, children }: MenuItem) {
            return (
              <TreeItem textValue={name}>
                <Content type={type} name={name} reference={reference} children={children} />
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
