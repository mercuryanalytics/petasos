import React, { PropsWithChildren } from "react"

import Title from "./title"

import "./index.scss"

export const MainContent: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="MainContent">
      <Title />
      {children}
    </div>
  )
}

export default MainContent
