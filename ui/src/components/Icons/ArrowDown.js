import * as React from "react";

function SvgArrowDown(props) {
  return (
    <svg width={12} height={10} {...props}>
      <defs>
        <path
          d="M713.27 139.309l4.597 7.15a1 1 0 01-.842 1.541h-9.193a1 1 0 01-.842-1.54l4.597-7.151a1 1 0 011.683 0z"
          id="ArrowDown_svg__a"
        />
      </defs>
      <use
        fill="currentColor"
        transform="rotate(-180 359.429 74)"
        xlinkHref="#ArrowDown_svg__a"
        fillRule="evenodd"
      />
    </svg>
  );
}

export default SvgArrowDown;
