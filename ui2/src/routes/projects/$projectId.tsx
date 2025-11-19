import { createFileRoute } from "@tanstack/react-router"
import ProjectBody from "../../components/main_content/project_body"
import { findRecord } from "../../components/common/router/util"

const Project = () => <ProjectBody />

export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: ({ params, location }) => {
    findRecord(params, location)
  },
  loader: ({ params, location }) => findRecord(params, location).name,
  component: Project
})
