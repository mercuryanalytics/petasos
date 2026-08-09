import React from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Checkbox, Input, Label, SearchField } from "react-aria-components"

import * as atoms from "../../../atoms"

import { CustomCheckbox } from "../../icons"

import "./index.scss"

const Search: React.FC = () => {
  const showSearch = useAtomValue(atoms.showSearch)
  const [hideClients, setHideClients] = useAtom(atoms.hideClients)
  const [searchClients, setSearchClients] = useAtom(atoms.searchClients)
  const [searchProjects, setSearchProjects] = useAtom(atoms.searchProjects)
  const [searchReports, setSearchReports] = useAtom(atoms.searchReports)
  const setInputValue = useSetAtom(atoms.inputValue)

  return (
    <div className="SearchMenu">
      <SearchField>
        <Label />
        <Input
          placeholder="Search"
          onChange={({ target: { value } }) => {
            setInputValue(value)
          }}
        />
      </SearchField>
      {showSearch && (
        <div className="SearchDropdown">
          <label>
            <strong>Search For</strong>
          </label>
          <Checkbox isSelected={searchClients} onChange={setSearchClients}>
            Clients
            <CustomCheckbox />
          </Checkbox>
          <Checkbox isSelected={searchProjects} onChange={setSearchProjects}>
            Projects
            <CustomCheckbox />
          </Checkbox>
          <Checkbox isSelected={searchReports} onChange={setSearchReports}>
            Reports
            <CustomCheckbox />
          </Checkbox>
          <Checkbox isSelected={hideClients} onChange={setHideClients}>
            Hide Clients
            <CustomCheckbox />
          </Checkbox>
        </div>
      )}
    </div>
  )
}

export default Search
