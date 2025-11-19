import { createFileRoute } from "@tanstack/react-router"

import ClientBody from "../../components/main_content/client_body"

import { findRecord } from "../../components/common/router/util"

export const Route = createFileRoute("/clients/$clientId")({
  // FIXME: Maybe find a betterway to use record with redirect to for before load and loader
  beforeLoad: ({ params, location }) => {
    findRecord(params, location)
  },
  loader: ({ params, location }) => findRecord(params, location).name,
  component: () => <ClientBody />
})
