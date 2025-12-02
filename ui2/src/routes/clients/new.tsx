import { createFileRoute } from "@tanstack/react-router"
import NewClientBody from "../../components/main_content/new_client_body"

export const Route = createFileRoute("/clients/new")({
  component: NewClientBody
})
