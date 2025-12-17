import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import "./index.scss"

const router = createRouter({ routeTree })
export type AppRouter = typeof router

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter
  }
}

const root = document.getElementById("root")

if (root) {
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
