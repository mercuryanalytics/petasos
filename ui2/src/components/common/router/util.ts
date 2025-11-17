import { redirect } from "@tanstack/react-router"
import { MenuItem } from "../types"

export const matchReference = (
  params: {
    clientId: string
  },
  data: MenuItem[]
) => {
  if (!data.some(item => item.type === "clients" && item.reference === params.clientId))
    throw redirect({ to: `/${params.clientId}` })
}
