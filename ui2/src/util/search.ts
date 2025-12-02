import { MenuItem } from "../components/common/types"
import { clients } from "./records"

//FIXME: Check how to improve this method further. Also add asynchronous functionality with loading to search through large dataset
export const search = (text: string, searchClients: boolean, searchProjects: boolean, searchReports: boolean) => {
  const matchingClients = clients.filter(({ name }) => name.toLowerCase().includes(text))
  if (searchClients && matchingClients.length > 0) return matchingClients

  const matchingRecordsByClient = clients.reduce<MenuItem[]>((acc, client) => {
    const matchingProjects = client.children.filter(project => project.name.toLowerCase().includes(text))
    const matchingProjectsByReports = client.children
      .map(project => {
        const reports = project.children.filter(report => report.name.toLowerCase().includes(text))
        if (reports.length === 0) return

        return { ...project, children: reports }
      })
      .filter(child => child != null)

    if (searchProjects && matchingProjects.length > 0) {
      acc.push({ ...client, children: matchingProjects })
    } else {
      if (searchReports && matchingProjectsByReports.length > 0) {
        acc.push({ ...client, children: matchingProjectsByReports })
      } else {
        return acc
      }
    }

    return acc
  }, [])

  return matchingRecordsByClient.length > 0 ? matchingRecordsByClient : []
}
