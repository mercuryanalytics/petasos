import { atom } from "jotai"

export const showInput = atom(false)
export const showSearch = atom(false)
export const hideClients = atom(false)
export const searchValue = atom<string>()
