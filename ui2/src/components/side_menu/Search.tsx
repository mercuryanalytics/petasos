import React, { useState } from "react";
import { Input, Label, SearchField } from "react-aria-components";

import CustomCheckbox from "../icons/custom_checkbox";

import "./react_search_stylesheet.scss";

const Search: React.FC = () => {
  const [showSearch, setShowSearch] = useState(false);
  // TODO: Change this eventListener
  window.addEventListener("click", () => setShowSearch(false));
  return (
    <>
      <SearchField>
        <Label />
        <Input placeholder="Search" onInput={() => setShowSearch(true)} />
      </SearchField>
      {showSearch && (
        <div>
          <label>
            <strong>Search For</strong>
          </label>
          <label>
            <span>Clients</span>
            <CustomCheckbox />
          </label>
          <label>
            <span>Projects</span>
            <CustomCheckbox />
          </label>
          <label>
            <span>Reports</span>
            <CustomCheckbox />
          </label>
          <label>
            <strong>Hide Clients</strong>
            <CustomCheckbox checked={false} />
          </label>
        </div>
      )}
    </>
  );
};

export default Search;
