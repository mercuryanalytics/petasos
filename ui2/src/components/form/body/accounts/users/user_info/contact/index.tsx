import React from "react"
import { Input, TextField } from "react-aria-components"

import "./index.scss"

// Note: This is a temporary data until real one is used
const contactInfo = {
  Name: "User Name",
  Title: "",
  ["Phone number"]: "",
  ["Fax Number"]: "",
  ["Address Line 1"]: "",
  ["Address Line 2"]: "",
  City: "",
  State: "",
  ["Zip code"]: "",
  Country: "USA"
}

const Contact: React.FC<{ showInput: boolean }> = ({ showInput }) => (
  <div className="Contact">
    <h1>Primary Contact</h1>
    <div>
      {Object.entries(contactInfo).map((c, i) => (
        <div key={i}>
          <label>
            {c[0] +
              " " +
              (showInput && c[0] !== "Title" && c[0] !== "Fax Number" && c[0] !== "Address Line 2" && c[0] !== "Country"
                ? "*"
                : "")}
          </label>
          {showInput ? (
            <TextField aria-label="primary-contact-input-field">
              <Input value={c[1]} />
            </TextField>
          ) : (
            <span>N/A</span>
          )}
        </div>
      ))}
    </div>
  </div>
)

export default Contact
