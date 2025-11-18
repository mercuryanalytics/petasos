import { createFileRoute } from "@tanstack/react-router"
import ReportBody from "../../components/main_content/report_body"
import { redirectTo } from "../../components/common/router/util"

const Report = () => <ReportBody />

export const Route = createFileRoute("/reports/$reportId")({
  beforeLoad: ({ params, location }) => {
    redirectTo(params, location)
  },
  component: Report
})
