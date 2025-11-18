import { createFileRoute } from "@tanstack/react-router"
import ProjectBody from "../../components/main_content/project_body"
import { redirectTo } from "../../components/common/router/util"

const Project = () => <ProjectBody />

export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: ({ params, location }) => {
    redirectTo(params, location)
  },
  component: Project
})
