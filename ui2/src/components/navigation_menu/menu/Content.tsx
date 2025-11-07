import React from "react"

import { UNSTABLE_TreeItemContent as TreeItemContent, Button } from "react-aria-components"

import { useSetAtom } from "jotai"
import { showMainMenuAtom } from "../../../atoms"

import { ArrowRight, Folder, File } from "../../icons"

type Props = {
  type: string
  title: string
  children: {
    id: number
    type: string
    title: string
    children: {
      id: number
      type: string
      title: string
      children: never[]
    }[]
  }[]
}

export const Content: React.FC<Props> = ({ type, title, children }) => {
  const setShowMainMenu = useSetAtom(showMainMenuAtom)

  return (
    <TreeItemContent>
      <a
        href="#"
        onClick={() => {
          setShowMainMenu(type)
        }}
      >
        {children.length ? (
          <Button slot="chevron">
            <ArrowRight />
          </Button>
        ) : null}
        {title === "Client" ? (
          <div className="logo">
            <img src="images/mercury_logo.png" alt="" />
          </div>
        ) : title === "Project" ? (
          <Folder />
        ) : (
          <File />
        )}
        <span>{title}</span>
      </a>
    </TreeItemContent>
  )
}

export default Content
