import React from "react"
import { UNSTABLE_TreeItem as TreeItem, UNSTABLE_TreeItemContent as TreeItemContent } from "react-aria-components"

import { useSetAtom } from "jotai"
import { showMainMenuAtom } from "../../../../atoms"

import "./index.scss"

const InsertItem: React.FC<{ title: string }> = ({ title }) => {
  const setShowMainMenu = useSetAtom(showMainMenuAtom)

  return (
    <TreeItem textValue={title}>
      <TreeItemContent>
        <a href="#" onClick={() => setShowMainMenu(`New${title}`)}>
          <span>
            <strong>{`+ Add new ${title.toLowerCase()}`}</strong>
          </span>
        </a>
      </TreeItemContent>
    </TreeItem>
  )
}

export default InsertItem
