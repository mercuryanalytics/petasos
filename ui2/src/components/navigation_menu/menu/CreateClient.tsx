import { useNavigate } from "@tanstack/react-router"
import React from "react"
import { Button } from "react-aria-components"

const CreateClient: React.FC = () => {
  const navigate = useNavigate()
  return (
    <Button>
      <a
        onClick={() => {
          navigate({ to: "/clients/new" })
        }}
      >
        + Create New Client
      </a>
    </Button>
  )
}

export default CreateClient
