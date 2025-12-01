import React from "react"
import { UNSTABLE_TreeItemContent as TreeItemContent, Button } from "react-aria-components"
import { useNavigate } from "@tanstack/react-router"

import { ArrowRight, Folder, File } from "../../icons"
import { MenuItem } from "../../common/types"
import { dynamicLinks } from "./util"

export const Content: React.FC<MenuItem> = ({ type, name, reference, children }) => {
  const navigate = useNavigate()

  return (
    <TreeItemContent>
      <a
        onClick={() => {
          navigate(dynamicLinks(type, reference))
        }}
      >
        {children.length ? (
          <Button slot="chevron">
            <ArrowRight />
          </Button>
        ) : null}
        {type === "clients" ? (
          <div className="logo">
            <img src="/images/mercury_logo.png" alt="" />
          </div>
        ) : type === "projects" ? (
          <Folder />
        ) : (
          <File />
        )}
        <span>{type === "projects" ? reference + ": " + name : name}</span>
      </a>
    </TreeItemContent>
  )
}

export default Content
