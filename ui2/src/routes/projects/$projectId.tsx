import { createFileRoute } from "@tanstack/react-router"
import ProjectBody from "../../components/main_content/project_body"
import { findRecord } from "../-util"

export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: ({ params, location }) => ({ record: findRecord(params, location) }),
  loader: ({ context }) => context.record.name,
  component: () => <ProjectBody />
})
