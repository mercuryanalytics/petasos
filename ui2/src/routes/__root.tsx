import { createRootRoute, Link, Outlet } from "@tanstack/react-router"
import App from "../App"
import { Button } from "react-aria-components"

export const Route = createRootRoute({
  component: () => (
    <App>
      <Outlet />
    </App>
  ),
  notFoundComponent: () => (
    <div>
      <h1>Page not Found</h1>
      <Button>
        <Link to="/"> Go Home </Link>
      </Button>
    </div>
  )
})
