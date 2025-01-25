import React from "react"

import { UNSTABLE_TreeItemContent as TreeItemContent, Button } from "react-aria-components"
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
  return (
    <TreeItemContent>
      <a href="#">
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
