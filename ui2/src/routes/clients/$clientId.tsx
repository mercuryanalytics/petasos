import { createFileRoute } from "@tanstack/react-router"

import ClientBody from "../../components/main_content/client_body"

import { redirectTo } from "../../components/common/router/util"

export const Route = createFileRoute("/clients/$clientId")({
  beforeLoad: ({ params, location }) => {
    redirectTo(params, location)
  },
  component: () => <ClientBody />
})
