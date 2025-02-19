import React from "react"

import "./index.scss"
import CustomTooltip from "./CustomTooltip"

const Overview: React.FC = () => (
  <div className="Overview">
    <div>
      <span>Access</span>
      <CustomTooltip delay={0} closeDelay={0} placement="bottom">
        <div>
          <h2>Client Level:</h2>
          <ul>
            <li>View the Client's and all it's Projects' and Reports' Details;</li>
          </ul>
          <h2> Project level:</h2>
          <ul>
            <li>View the Project's and all it's Reports' Details;</li>
          </ul>
        </div>
      </CustomTooltip>
    </div>
    <div>
      <span>View</span>
      <CustomTooltip delay={0} closeDelay={0} placement="bottom">
        <div>
          <h2>Client Level:</h2>
          <ul>
            <li>View the Client's Details;</li>
          </ul>
          <h2> Project level:</h2>
          <ul>
            <li>View the Project's Details;</li>
          </ul>
          <h2> Report level:</h2>
          <ul>
            <li>View the Report's Details;</li>
          </ul>
        </div>
      </CustomTooltip>
    </div>
    <div>
      <span>Edit</span>
      <CustomTooltip delay={0} closeDelay={0} placement="bottom">
        <div>
          <h2>Client Level:</h2>
          <ul>
            <li>Edit the Client's and all it's Projects' and Reports' Details;</li>
            <li>Ability to Create / Delete Reports within the Client's Projects;</li>
          </ul>
          <h2> Project level:</h2>
          <ul>
            <li>Edit the Project's and all it's Reports' Details;</li>
            <li>Ability to Create / Delete Reports within the Project;</li>
          </ul>
          <h2> Report level:</h2>
          <ul>
            <li>Edit the Report's Details;</li>
          </ul>
        </div>
      </CustomTooltip>
    </div>
  </div>
)

export default Overview
