import React from "react"
import { useAtomValue } from "jotai"

import { showMainMenuAtom } from "../../atoms"

import Title from "./title"

// TODO: Change the names of the below components if required
import ClientBody from "./client_body"
import NewProjectBody from "./new_project_body"
import ProjectBody from "./project_body"
import ReportBody from "./report_body"
import NewReportBody from "./new_report_body"

import "./index.scss"

// NOTE: This will change with the introduction of tanstack
const menuSwitch = (menuName: string) => {
  switch (menuName) {
    case "Client":
      return <ClientBody />
    case "NewProject":
      return <NewProjectBody />
    case "Project":
      return <ProjectBody />
    case "Report":
      return <ReportBody />
    case "NewReport":
      return <NewReportBody />
    default:
      return null
  }
}

export const MainContent: React.FC = () => {
  const showMainMenu = useAtomValue(showMainMenuAtom)

  return (
    <div className="MainContent">
      <Title />
      {menuSwitch(showMainMenu)}
    </div>
  )
}

export default MainContent
