import React, { useRef, useEffect } from 'react';
import './Tooltip.module.css';
import { default as ReactTooltip } from 'react-tt';

const Tooltip = props => {
  const location = props.location || 'top';
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef && containerRef.current) {
      const rootNode = containerRef.current.el;
      if (rootNode && !rootNode.getAttribute('data-tt-location')) {
        rootNode.setAttribute('data-tt-location', location);
      }
    }
  }, [containerRef, location]);

  return (
    <ReactTooltip {...props} ref={containerRef}>
      {props.children}
    </ReactTooltip>
  );
};

export default Tooltip;
