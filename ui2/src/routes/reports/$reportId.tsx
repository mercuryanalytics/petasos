import { createFileRoute } from "@tanstack/react-router"
import ReportBody from "../../components/main_content/report_body"
import RouteError from "../../components/common/route_error"
import { findRecord } from "../-util"

export const Route = createFileRoute("/reports/$reportId")({
  beforeLoad: ({ params, location }) => ({ record: findRecord(params, location) }),
  loader: ({ context }) => context.record,
  component: () => <ReportBody />,
  errorComponent: () => <RouteError />
})
