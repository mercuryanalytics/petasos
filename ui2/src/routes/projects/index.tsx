import { createFileRoute } from "@tanstack/react-router"
import { Home } from "../../components/common/Home"

export const Route = createFileRoute("/projects/")({
  component: () => <Home />
})
