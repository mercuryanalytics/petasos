import { ParsedLocation, redirect } from "@tanstack/react-router"
import { clients, projects, reports } from "../util/records"

export const findRecord = (
  params: {
    clientId?: string
    projectId?: string
    reportId?: string
  },

  location: ParsedLocation<object>
) => {
  const type = location.href.split("/")[1]

  switch (type) {
    case "clients": {
      const client = clients.find(item => item.reference === params.clientId)
      // NOTE: Do check if its required to redirect the user to not found home page or throw an error and show an Outlet component
      if (client == null) throw redirect({ to: ".." })

      return client
    }
    case "projects": {
      const project = projects.find(item => item.reference === params.projectId)
      if (project == null) throw redirect({ to: ".." })

      return project
    }

    case "reports": {
      const report = reports.find(item => item.reference === params.reportId)
      if (report == null) throw redirect({ to: ".." })
      return report
    }
    default:
      throw redirect({ to: "/" })
  }
}
