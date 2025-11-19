import { createFileRoute } from "@tanstack/react-router"
import ReportBody from "../../components/main_content/report_body"
import { findRecord } from "../../components/common/router/util"

const Report = () => <ReportBody />

export const Route = createFileRoute("/reports/$reportId")({
  beforeLoad: ({ params, location }) => {
    findRecord(params, location)
  },
  loader: ({ params, location }) => findRecord(params, location).name,
  component: Report
})
