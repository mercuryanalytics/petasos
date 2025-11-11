import { createFileRoute } from "@tanstack/react-router"
import ClientBody from "../../components/main_content/client_body"

const Client = () => <ClientBody />

export const Route = createFileRoute("/clients/$clientId")({
  component: Client
  // loader: async ({ params }) => {
  //   return {
  //     clientId: params.clientId
  //   }
  // }
})
