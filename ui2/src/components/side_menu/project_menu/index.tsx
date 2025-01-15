import React from "react";
import { ArrowRight } from "../../icons";
import { Button } from "react-aria-components";

import "./index.scss";

const ProjectMenu: React.FC = () => {
  return (
    <div className="Project-Menu">
      <ul>
        <li>
          <a href="#">
            <div>
              <ArrowRight />
            </div>
            <div>
              <img src="images/mercury_logo.png" alt="" />
            </div>
            <span>Ascention</span>
          </a>
        </li>
        <li>
          <a href="#">
            <div>
              <ArrowRight />
            </div>
            <div>
              <img src="images/mercury_logo.png" alt="" />
            </div>
            <span>BSGCO</span>
          </a>
        </li>
        <li>
          <a href="#">
            <div>
              <ArrowRight />
            </div>
            <div>
              <img src="images/mercury_logo.png" alt="" />
            </div>
            <span>ESOH</span>
          </a>
        </li>
      </ul>
      <Button>
        <a href="#">+ Create New Client</a>
      </Button>
    </div>
  );
};

export default ProjectMenu;
