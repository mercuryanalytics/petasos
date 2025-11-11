import { createFileRoute } from "@tanstack/react-router"
import NewReportBody from "../../../components/main_content/new_report_body"

const NewReport = () => <NewReportBody />

export const Route = createFileRoute("/reports/new/$projectId")({
  component: NewReport
})
