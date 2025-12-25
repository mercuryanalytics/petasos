import { atom } from "jotai"

import { search } from "../util/search"

export const showInput = atom(false)
export const showSearch = atom(false)

export const hideClients = atom(false)
export const searchClients = atom(true)
export const searchProjects = atom(true)
export const searchReports = atom(true)

export const inputValue = atom<string>()

export const menuItems = atom(get => {
  const value = get(inputValue)?.toLowerCase().trim()
  if (value === "" || value == null) return

  return search(value, get(searchClients), get(searchProjects), get(searchReports))
})

export const newClientFormCount = atom(0)

export const expandedKeys = atom<string[]>([])
