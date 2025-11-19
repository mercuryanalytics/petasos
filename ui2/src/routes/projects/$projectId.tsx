import { createFileRoute } from "@tanstack/react-router"
import ProjectBody from "../../components/main_content/project_body"
import { findRecord } from "../-util"

export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: ({ params, location }) => {
    findRecord(params, location)
  },
  loader: ({ params, location }) => findRecord(params, location).name,
  component: () => <ProjectBody />
})
