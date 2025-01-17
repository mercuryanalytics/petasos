import React, { useMemo } from "react"
const Folder: React.FC = () => {
  const id = useMemo(() => Math.random().toFixed(2), [])

  return (
    <svg width="19" height="14" fill="black" fillRule="nonzero">
      <path
        d="M672.644 136l1.208 2.141h6.648a1.5 1.5 0 011.493 1.356l.007.145v8.858a1.5 1.5 0 01-1.5 1.5h-16a1.5 1.5 0 01-1.5-1.5v-11a1.5 1.5 0 011.5-1.5h8.144zm8.356 5.91h-17v6.59a.5.5 0 00.41.492l.09.008h16a.5.5 0 00.5-.5v-6.59zm-8.94-4.91h-7.56a.5.5 0 00-.5.5v3.41h17v-1.268a.5.5 0 00-.41-.492l-.09-.008h-7.23L672.06 137z"
        id={`Folder-${id}`}
      ></path>
      <use href={`#Folder-${id}`} transform="translate(-663 -136)"></use>
    </svg>
  )
}

export default Folder
