import { linkOptions } from "@tanstack/react-router"

// FIXME: Check later for routing with better functionality
export const dynamicLinks = (type: string, reference: string, insertItem: boolean = false) => {
  return linkOptions({
    to: "/" + type + (insertItem ? "/new/" : "/") + reference
  })
}
