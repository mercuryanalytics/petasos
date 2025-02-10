import React, { useMemo } from "react"

const TrailingDots: React.FC = () => {
  const id = useMemo(() => Math.random().toFixed(2), [])

  return (
    <svg width="20" height="5">
      <defs>
        <path
          d="M591 146a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm7.5-5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm-15 0a2.5 2.5 0 110 5 2.5 2.5 0 010-5z"
          id={`Menu-${id}`}
        ></path>
      </defs>
      <use fill="currentColor" href={`#Menu-${id}`} transform="translate(-581 -141)" fillRule="evenodd"></use>
    </svg>
  )
}

export default TrailingDots
