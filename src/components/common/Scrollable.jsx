import React, { useRef, useEffect } from 'react';
import './Scrollable.module.css';
import SimpleBarReact from 'simplebar-react';
import 'simplebar/src/simplebar.css';

const Scrollable = props => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef && containerRef.current) {
      const contentNode = containerRef.current.contentEl;
      if (contentNode && !contentNode.getAttribute('data-scrollable-content')) {
        contentNode.setAttribute('data-scrollable-content', 'true');
      }
    }
  }, [containerRef]);

  return (
    <SimpleBarReact ref={containerRef} data-scrollable className={`${props.className || ''}`}>
      {props.children}
    </SimpleBarReact>
  );
};

export default Scrollable;
