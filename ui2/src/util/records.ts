import menuItems from "../../public/menuItems"

export const clients = menuItems.filter(item => item.type === "clients")
export const projects = clients.flatMap(item => item.children.filter(item => item.type === "projects"))
export const reports = projects.flatMap(item => item.children.filter(item => item.type === "reports"))
