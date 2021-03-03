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
      document.addEventListener('scroll', function(event) {
        containerRef.current.recalculate();
        let xPosition = window.scrollX;
        Array.from(document.getElementsByClassName('first-child')).forEach(element => {
          element.style.transform = `translateX(${xPosition}px)`;
        });
      });

    }
  }, [containerRef, document]);

  return (
    <SimpleBarReact ref={containerRef} data-scrollable className={`${props.className || ''}`}>
      {props.children}
    </SimpleBarReact>
  );
};

export default Scrollable;
