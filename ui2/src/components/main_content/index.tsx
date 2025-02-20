import React from "react"

import "../../styles/react_aria_text_field.scss"
import "../../styles/react_aria_select.scss"

import Title from "./title"
import Body from "./body"

import "./index.scss"

export const MainContent: React.FC = () => (
  <div className="MainContent">
    <Title />
    <Body />
  </div>
)

export default MainContent
