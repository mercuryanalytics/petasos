import { useEffect, useState } from "react"

const useFetch = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:3000/clients")
      const json = await response.json()
      setData(json)
    }

    fetchData()
  }, [])
  return data
}

export default useFetch
