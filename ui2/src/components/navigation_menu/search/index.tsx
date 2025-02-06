import React, { useState } from "react"
import { Checkbox, Input, Label, SearchField } from "react-aria-components"

import { CustomCheckbox } from "../../icons"

import "./index.scss"

const Search: React.FC = () => {
  const [showSearch, setShowSearch] = useState(false)
  // TODO: Change this eventListener
  // window.addEventListener("click", () => setShowSearch(false));
  return (
    <div>
      <SearchField>
        <Label />
        <Input placeholder="Search" onInput={() => setShowSearch(true)} />
      </SearchField>
      {showSearch && (
        <div className="SearchDropdown">
          <label>
            <strong>Search For</strong>
          </label>
          <Checkbox>
            Clients
            <CustomCheckbox />
          </Checkbox>
          <Checkbox>
            Projects
            <CustomCheckbox />
          </Checkbox>
          <Checkbox>
            Reports
            <CustomCheckbox />
          </Checkbox>
          <Checkbox>
            Hide Clients
            <CustomCheckbox />
          </Checkbox>
        </div>
      )}
    </div>
  )
}

export default Search
