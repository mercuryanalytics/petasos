import React from "react"
import { UNSTABLE_TreeItemContent as TreeItemContent, Button } from "react-aria-components"
import { useNavigate } from "@tanstack/react-router"
import { useSetAtom } from "jotai"

import * as atoms from "../../../atoms"

import { ArrowRight, Folder, File } from "../../icons"
import { MenuItem } from "../../common/types"
import { dynamicLinks, findPathByName } from "./util"

export const Content: React.FC<MenuItem & { records: MenuItem[] }> = ({ type, name, reference, children, records }) => {
  const navigate = useNavigate()
  const setExpandedKeys = useSetAtom(atoms.expandedKeys)
  const setBreadCrumbs = useSetAtom(atoms.breadcrumbs)

  return (
    <TreeItemContent>
      <a
        onClick={() => {
          navigate(dynamicLinks(type, reference))

          setExpandedKeys(current => {
            if (current.has(name)) {
              const set = new Set(current)
              set.delete(name)
              return set
            }
            return new Set(current).add(name)
          })

          setBreadCrumbs(findPathByName(records, name))
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
