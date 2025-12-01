import React from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Checkbox, Input, Label, SearchField } from "react-aria-components"

import * as atoms from "../../../atoms"
import { search } from "../../../util/search"

import { CustomCheckbox } from "../../icons"

import "./index.scss"

const Search: React.FC = () => {
  const showSearch = useAtomValue(atoms.showSearch)
  const [hideClients, setHideClients] = useAtom(atoms.hideClients)
  const setMenuItems = useSetAtom(atoms.menuItems)

  return (
    <div className="SearchMenu">
      <SearchField>
        <Label />
        <Input
          placeholder="Search"
          onChange={({ target: { value } }) => {
            const text = value.toLowerCase().trim()
            if (!text) return

            setMenuItems(search(text))
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
