import { ParsedLocation, redirect } from "@tanstack/react-router"

import menuItems from "../../public/menuItems"

const clients = menuItems.filter(item => item.type === "clients")
const projects = clients.flatMap(item => item.children.filter(item => item.type === "projects"))
const reports = projects.flatMap(item => item.children.filter(item => item.type === "reports"))

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
      if (client == null) throw redirect({ to: `/${params.clientId}` })

      return client
    }
    case "projects": {
      const project = projects.find(item => item.reference === params.projectId)
      if (project == null) throw redirect({ to: `/${params.projectId}` })

      return project
    }

    default: {
      const report = reports.find(item => item.reference === params.reportId)

      if (report == null) throw redirect({ to: `/${params.reportId}` })

      return report
    }
  }
}
