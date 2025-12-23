import { createFileRoute } from "@tanstack/react-router"
import ClientBody from "../../components/main_content/client_body"
import { findRecord } from "../-util"

export const Route = createFileRoute("/clients/$clientId")({
  beforeLoad: ({ params, location }) => ({ record: findRecord(params, location) }),
  loader: ({ context }) => context.record,
  component: () => <ClientBody />
})
