import React from "react"
import { useAtom } from "jotai"
import { Checkbox, Input, Label, SearchField } from "react-aria-components"

import { search } from "../../../atoms"

import { CustomCheckbox } from "../../icons"

import "./index.scss"

const Search: React.FC = () => {
  const [showSearch, setShowSearch] = useAtom(search)

  return (
    <div>
      <SearchField>
        <Label />
        <Input className="react-aria-Input NavigationInput" placeholder="Search" onInput={() => setShowSearch(true)} />
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
