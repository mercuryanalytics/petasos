import React from "react"
import { useAtom } from "jotai"

import { newClientFormCount } from "../../../../atoms"

import Footer from "./footer"
import { FORMS, handleReset, handleSubmit } from "./util"
import "./index.scss"

export const NewClientForm: React.FC = () => {
  const [count, setCount] = useAtom(newClientFormCount)

  const ClientComponent = FORMS[count].component

  return (
    <form
      className="NewClientForm"
      onSubmit={event => {
        handleSubmit(event, count, (value: number) => {
          setCount(value)
        })
      }}
      onReset={event => {
        handleReset(event)
        setCount(0)
      }}
    >
      <ClientComponent />
      <Footer />
    </form>
  )
}

export default NewClientForm
