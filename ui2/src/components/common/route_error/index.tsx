import { useRouter } from "@tanstack/react-router"

const RouteError = () => {
  const router = useRouter()

  return (
    <div role="alert" style={{ padding: "1rem" }}>
      <strong>Failed to load this page.</strong>
      <div style={{ marginTop: "0.5rem" }}>
        <button onClick={() => router.invalidate()}>Try again</button>
      </div>
    </div>
  )
}

export default RouteError
