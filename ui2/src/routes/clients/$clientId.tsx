import { createFileRoute } from "@tanstack/react-router"

import ClientBody from "../../components/main_content/client_body"
import menuItems from "../../../public/menuItems"

import { matchReference } from "../../components/common/router/util"

export const Route = createFileRoute("/clients/$clientId")({
  beforeLoad: ({ params }) => {
    matchReference(params, menuItems)
  },
  component: () => <ClientBody />
})
