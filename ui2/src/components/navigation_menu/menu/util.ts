import { linkOptions } from "@tanstack/react-router"
import { MenuItem } from "../../common/types"

// FIXME: Check later for routing with better functionality
export const dynamicLinks = (type: string, reference: string, insertItem: boolean = false) => {
  return linkOptions({
    to: "/" + type + (insertItem ? "/new/" : "/") + reference
  })
}

export const findPathByName = (tree: MenuItem[], name: string, path: MenuItem[] = []): MenuItem[] | undefined => {
  for (const node of tree) {
    const newPath = [...path, node]

    if (node.name === name) {
      return newPath
    }

    if (node.children?.length) {
      const result = findPathByName(node.children, name, newPath)
      if (result) return result
    }
  }
}
