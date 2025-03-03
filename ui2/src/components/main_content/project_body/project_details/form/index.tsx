import React from "react"
import { Input, TextField } from "react-aria-components"

import "./index.scss"

// Note: This is a temporary data until real one is used

const projectDetails = {
  ["Project name"]: "TEST",
  Project: "0000",
  ["Project type"]: "Custom Research",
  Description: "View Project '0000: TEST'",
  ["Research Contact"]: "abc@gmail.com",
  Phone: "111-111-11111 x 301",
  Email: "abc@gmail.com",
  ["Last updated"]: "Thursday 20 October 2022"
}

const ProjectDetailsForm: React.FC<{ showInput: boolean }> = ({ showInput }) => (
  <form className="ProjectDetailsForm">
    {Object.entries(projectDetails).map((p, i) => (
      <div key={i}>
        <label>{p[0] + " " + (p[0] === "Project name" || p[0] === "Project type" ? "*" : "")}</label>
        {showInput && p[0] !== "Phone" && p[0] !== "Email" ? (
          <TextField isDisabled={p[0] === "Last updated"} aria-label="primary-contact-input-field">
            <Input value={p[1]} />
          </TextField>
        ) : (
          <span>{p[1]}</span>
        )}
      </div>
    ))}
  </form>
)

export default ProjectDetailsForm
