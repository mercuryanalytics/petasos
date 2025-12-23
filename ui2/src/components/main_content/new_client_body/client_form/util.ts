import { FormEvent } from "react"
import { ClientForm } from "../../../common/form_components"

export const FORMS = [
  { component: ClientForm.ClientDetails },
  { component: ClientForm.PrimaryContact },
  { component: ClientForm.Address }
] as const

export const handleSubmit = (event: FormEvent<HTMLFormElement>, count: number, setCount: (value: number) => void) => {
  const data: object[] = []
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
  if (count < FORMS.length - 1) {
    setCount(count + 1)
    data.push(Object.fromEntries(formData.entries()))
    return
  }

  setCount(FORMS.length - 1)

  console.log(data)
}

export const handleReset = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  event.currentTarget.reset()
}
