import React from "react"
import { useAtomValue } from "jotai"

import { showMainMenuAtom } from "../../atoms"

import "../../styles/react_aria_select.scss"

import Title from "./title"
import ClientBody from "./client_body"

import "./index.scss"
import NewProjectBody from "./new_project_body"

export const MainContent: React.FC = () => {
  const showMainMenu = useAtomValue(showMainMenuAtom)

  return (
    <div className="MainContent">
      <Title />
      {showMainMenu === "Client" ? <ClientBody /> : showMainMenu === "New-Project" ? <NewProjectBody /> : null}
    </div>
  )
}

export default MainContent
