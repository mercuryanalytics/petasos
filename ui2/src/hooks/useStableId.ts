import { useId } from "react"

const useStableId = () => useId().replace(/:/g, "")

export default useStableId
