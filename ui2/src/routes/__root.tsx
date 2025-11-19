import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router"
import App from "../App"

import PageNotFound from "./-PageNoteFound"

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
  notFoundComponent: () => <PageNotFound />
})
