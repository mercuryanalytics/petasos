import { createFileRoute } from "@tanstack/react-router"
import ClientBody from "../../components/main_content/client_body"
import RouteError from "../../components/common/route_error"
import { findRecord } from "../-util"

export const Route = createFileRoute("/clients/$clientId")({
  beforeLoad: ({ params, location }) => ({ record: findRecord(params, location) }),
  loader: ({ context }) => context.record,
  component: () => <ClientBody />,
  errorComponent: () => <RouteError />
})
