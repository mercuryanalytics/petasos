import React from "react"
import { UNSTABLE_TreeItem as TreeItem, UNSTABLE_TreeItemContent as TreeItemContent } from "react-aria-components"

import { useSetAtom } from "jotai"
import { showMainMenuAtom } from "../../../../atoms"

import "./index.scss"

const InsertItem: React.FC<{ type: string }> = ({ type }) => {
  const setShowMainMenu = useSetAtom(showMainMenuAtom)

  return (
    <TreeItem textValue={type}>
      <TreeItemContent>
        <a href="#" onClick={() => setShowMainMenu(`New${type}`)}>
          <span>
            <strong>{`+ Add new ${type.toLowerCase()}`}</strong>
          </span>
        </a>
      </TreeItemContent>
    </TreeItem>
  )
}

export default InsertItem
