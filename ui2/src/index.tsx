import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import "./index.scss"

const router = createRouter({ routeTree })

const root = document.getElementById("root")

if (root) {
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
