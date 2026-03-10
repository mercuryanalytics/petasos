import { linkOptions } from "@tanstack/react-router"
import { MenuItem } from "../../common/types"

// NOTE: `dynamicLinks` builds route paths via string concatenation, which bypasses TanStack Router's
// compile-time type checking. Typos in `type` (e.g. "client" vs "clients") are not caught at build time.
// To migrate: replace with explicit `linkOptions({ to: "/clients/$clientId", params: { clientId: reference } })`
// per route type, and update callers (Content.tsx) to pass the literal route strings instead.
// Prerequisite: route shapes must be stable before this refactor.
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
