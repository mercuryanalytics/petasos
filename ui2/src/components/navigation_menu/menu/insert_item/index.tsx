import React from "react"
import { UNSTABLE_TreeItem as TreeItem, UNSTABLE_TreeItemContent as TreeItemContent } from "react-aria-components"

import { useNavigate } from "@tanstack/react-router"
import { dynamicLinks } from "../util"

import "./index.scss"

const InsertItem: React.FC<{ type: string; reference: string }> = ({ type, reference }) => {
  const navigate = useNavigate()

  return (
    <TreeItem textValue={type}>
      <TreeItemContent>
        <a
          onClick={() => {
            navigate(dynamicLinks(type, reference, true))
          }}
        >
          <span>
            <strong>{`+ Add new ${type.toLowerCase()}`}</strong>
          </span>
        </a>
      </TreeItemContent>
    </TreeItem>
  )
}

export default InsertItem
