import { ParsedLocation, redirect } from "@tanstack/react-router"

import menuItems from "../../../../public/menuItems"

const clients = menuItems.filter(item => item.type === "clients")
const projects = clients.flatMap(item => item.children.filter(item => item.type === "projects"))
const reports = projects.flatMap(item => item.children.filter(item => item.type === "reports"))

export const redirectTo = (
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
      if (!clients.some(item => item.reference === params.clientId)) throw redirect({ to: `/${params.clientId}` })
      break
    }
    case "projects": {
      if (!projects.some(item => item.reference === params.projectId)) throw redirect({ to: `/${params.projectId}` })
      break
    }
    default: {
      if (!reports.some(item => item.reference === params.reportId)) throw redirect({ to: `/${params.reportId}` })
      break
    }
  }
}
