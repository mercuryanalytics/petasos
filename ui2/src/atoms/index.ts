import { atom } from "jotai"

import { MenuItem } from "../components/common/types"

export const showInput = atom(false)
export const showSearch = atom(false)
export const hideClients = atom(false)
export const menuItems = atom<MenuItem[]>()
