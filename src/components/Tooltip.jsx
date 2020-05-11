import React from 'react';
import './Tooltip.module.css';
import { default as ReactTooltip } from 'react-tt';

const Tooltip = props => {
  return (
    <ReactTooltip {...props}>
      {props.children}
    </ReactTooltip>
  );
};

export default Tooltip;
