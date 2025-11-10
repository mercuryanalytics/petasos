import { Link } from "@tanstack/react-router"
import { Button } from "react-aria-components"

export const Home = () => (
  <div>
    <h1>Page not Found</h1>
    <Button>
      <Link to="/"> Go Home </Link>
    </Button>
  </div>
)
