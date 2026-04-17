import { MenuItem } from "../components/common/types"
import { clients } from "./records"

// NOTE: This synchronous filter works well for the current static JSON dataset.
// When data is fetched from a real API, consider moving search server-side (query param on the API endpoint)
// or switching to a debounced async approach with a loading state shown in the search UI.
// A client-side async approach would need: (1) a loading atom, (2) a useTransition or setTimeout debounce,
// (3) a spinner or skeleton in the navigation menu while results resolve.
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
