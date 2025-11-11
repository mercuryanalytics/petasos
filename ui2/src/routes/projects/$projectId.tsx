import { createFileRoute } from "@tanstack/react-router"
import ProjectBody from "../../components/main_content/project_body"

const Project = () => <ProjectBody />

export const Route = createFileRoute("/projects/$projectId")({
  component: Project
})
