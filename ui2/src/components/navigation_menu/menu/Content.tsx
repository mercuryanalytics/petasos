import React from "react"
import { UNSTABLE_TreeItemContent as TreeItemContent, Button } from "react-aria-components"
import { useNavigate } from "@tanstack/react-router"
import { useAtom } from "jotai"

import { expandedKeys } from "../../../atoms"

import { ArrowRight, Folder, File } from "../../icons"
import { MenuItem } from "../../common/types"
import { dynamicLinks } from "./util"

export const Content: React.FC<MenuItem> = ({ type, name, reference, children }) => {
  const navigate = useNavigate()
  const [keys, setKeys] = useAtom(expandedKeys)

  return (
    <TreeItemContent>
      <a
        onClick={() => {
          navigate(dynamicLinks(type, reference))
          if (keys.includes(name)) {
            setKeys(current => current.filter(key => key !== name))
          } else setKeys(current => [...current, name])
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
