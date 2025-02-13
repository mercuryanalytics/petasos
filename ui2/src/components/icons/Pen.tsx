import React, { useMemo } from "react"

const Pen: React.FC = () => {
  const id = useMemo(() => Math.random().toFixed(2), [])

  return (
    <svg width="14" height="19">
      <defs>
        <path
          d="M510.8 133c.663 0 1.2.546 1.2 1.22v14.628L509.076 153 506 148.848v-14.629c0-.673.537-1.219 1.2-1.219h3.6zm-.441 16.082h-2.682l1.376 1.857 1.306-1.857zm.441-11.816h-3.6v10.596h3.6v-10.596zm0-3.047h-3.6v1.828h3.6v-1.828z"
          id={`Pen-${id}`}
        ></path>
      </defs>
      <use fill="currentColor" fillRule="nonzero" transform="rotate(30 505.681 -862.11)" href={`#Pen-${id}`}></use>
    </svg>
  )
}

export default Pen
