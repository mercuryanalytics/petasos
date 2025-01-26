import React from "react"
import "./index.scss"

import { UNSTABLE_TreeItem as TreeItem, UNSTABLE_TreeItemContent as TreeItemContent } from "react-aria-components"

const InsertItem: React.FC<{ title: string }> = ({ title }) => {
  return (
    <TreeItem textValue={title}>
      <TreeItemContent>
        <a href="#">
          <span>
            <strong>{`+ Add new ${title.toLowerCase()}`}</strong>
          </span>
        </a>
      </TreeItemContent>
    </TreeItem>
  )
}

export default InsertItem
