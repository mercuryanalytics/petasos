import { createFileRoute } from "@tanstack/react-router"
import PageNotFound from "../components/common/router/PageNotFound"

export const Route = createFileRoute("/__not_found")({
  component: () => <PageNotFound />
})
