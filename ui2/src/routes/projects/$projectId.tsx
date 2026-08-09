import { createFileRoute } from "@tanstack/react-router"
import ProjectBody from "../../components/main_content/project_body"
import RouteError from "../../components/common/route_error"
import { findRecord } from "../-util"

export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: ({ params, location }) => ({ record: findRecord(params, location) }),
  loader: ({ context }) => context.record,
  component: () => <ProjectBody />,
  errorComponent: () => <RouteError />
})
