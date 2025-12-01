import { MenuItem } from "../components/common/types"
import { clients } from "./records"

//FIXME: Check how to improve this method further
export const search = (inputValue?: string): MenuItem[] | undefined => {
  const value = inputValue?.trim().toLowerCase()
  if (!value) return clients

  const matchingClients = clients.filter(({ name }) => name.toLowerCase().includes(value))
  if (matchingClients.length > 0) return matchingClients

  const matchingProjectsByClient = clients.reduce<MenuItem[]>((acc, client) => {
    const matchingProjects = client.children.filter(project => project.name.toLowerCase().includes(value))
    const matchingReports = client.children
      .map(project => {
        const reports = project.children.filter(report => report.name.toLowerCase().includes(value))
        if (reports.length === 0) return

        return { ...project, children: reports }
      })
      .filter(child => child != null)

    if (matchingProjects.length > 0) {
      acc.push({ ...client, children: matchingProjects })
    } else {
      if (matchingReports.length > 0) {
        acc.push({ ...client, children: matchingReports })
      } else {
        return acc
      }
    }

    return acc
  }, [])

  return matchingProjectsByClient.length > 0 ? matchingProjectsByClient : undefined
}
