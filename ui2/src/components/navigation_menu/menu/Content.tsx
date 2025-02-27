import React from "react"

import { UNSTABLE_TreeItemContent as TreeItemContent, Button } from "react-aria-components"

import { useSetAtom } from "jotai"
import { showMainMenuAtom } from "../../../atoms"

import { ArrowRight, Folder, File } from "../../icons"

type Props = {
  title: string
  children: {
    id: number
    title: string
    children: {
      id: number
      title: string
      children: never[]
    }[]
  }[]
}

export const Content: React.FC<Props> = ({ title, children }) => {
  const setShowMainMenu = useSetAtom(showMainMenuAtom)

  return (
    <TreeItemContent>
      <a href="#" onClick={() => setShowMainMenu(title)}>
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
