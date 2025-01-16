import React, { useState } from "react";
import { ArrowRight } from "../../icons";
import { Button } from "react-aria-components";

import "./index.scss";

const ProjectMenu: React.FC = () => {
  const [rotate, setRotate] = useState(0);

  // TODO: Modify this method later using map index when using several list items
  const handleRotate = () => {
    if (rotate === 0) return setRotate(90);
    return setRotate(0);
  };

  return (
    <div className="Project-Menu">
      <ul>
        <li>
          <a href="#">
            <div onClick={handleRotate}>
              <ArrowRight rotate={rotate} />
            </div>
            <div>
              <img src="images/mercury_logo.png" alt="" />
            </div>
            <span>Ascention</span>
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
