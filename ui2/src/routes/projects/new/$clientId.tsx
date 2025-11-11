import { createFileRoute } from "@tanstack/react-router"
import NewProjectBody from "../../../components/main_content/new_project_body"

const NewProject = () => <NewProjectBody />

export const Route = createFileRoute("/projects/new/$clientId")({
  component: NewProject
})
