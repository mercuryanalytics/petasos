import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router"
import App from "../App"
import { Button } from "react-aria-components"

const Root = () => {
  if (useRouterState().statusCode >= 400) return <Outlet />

  return (
    <App>
      <Outlet />
    </App>
  )
}

export const Route = createRootRoute({
  component: Root,
  notFoundComponent: () => (
    <div>
      <h1>Page not Found</h1>
      <Button>
        <Link to="/"> Go Home </Link>
      </Button>
    </div>
  )
})
