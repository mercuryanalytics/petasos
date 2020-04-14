import * as React from "react";

function SvgMenu(props) {
  return (
    <svg width={20} height={5} {...props}>
      <defs>
        <path
          d="M591 146a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm7.5-5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm-15 0a2.5 2.5 0 110 5 2.5 2.5 0 010-5z"
          id="Menu_svg__a"
        />
      </defs>
      <use
        fill="#333"
        xlinkHref="#Menu_svg__a"
        transform="translate(-581 -141)"
        fillRule="evenodd"
      />
    </svg>
  );
}

export default SvgMenu;
