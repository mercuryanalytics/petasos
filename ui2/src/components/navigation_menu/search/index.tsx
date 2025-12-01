import React from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Checkbox, Input, Label, SearchField } from "react-aria-components"

import * as atoms from "../../../atoms"

import { CustomCheckbox } from "../../icons"

import "./index.scss"

const Search: React.FC = () => {
  const showSearch = useAtomValue(atoms.showSearch)
  const [hideClients, setHideClients] = useAtom(atoms.hideClients)
  const setSearchValue = useSetAtom(atoms.searchValue)

  return (
    <div className="SearchMenu">
      <SearchField>
        <Label />
        <Input
          placeholder="Search"
          onChange={({ target: { value } }) => {
            setSearchValue(value)
          }}
        />
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
          <Checkbox
            isSelected={hideClients}
            onChange={value => {
              setHideClients(value)
            }}
          >
            Hide Clients
            <CustomCheckbox />
          </Checkbox>
        </div>
      )}
    </div>
  )
}

export default Search
