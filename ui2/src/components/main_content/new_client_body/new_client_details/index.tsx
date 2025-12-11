import React, { FormEvent } from "react"

import NewClientLogo from "./logo"
import NewClientInfo from "./info"
import NewClientFooter from "./footer"

import "./index.scss"

const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
  console.log(Object.fromEntries(formData.entries()))
}

const handleReset = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  event.currentTarget.reset()
}

const NewClientDetails: React.FC = () => {
  return (
    <div className="NewClientDetails">
      <form onSubmit={handleSubmit} onReset={handleReset}>
        <NewClientLogo />
        <NewClientInfo />
        <NewClientFooter />
      </form>
    </div>
  )
}

export default NewClientDetails
