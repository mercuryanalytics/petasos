import { createFileRoute } from "@tanstack/react-router"
import ReportBody from "../../components/main_content/report_body"

const Report = () => <ReportBody />

export const Route = createFileRoute("/reports/$reportId")({
  component: Report
})
