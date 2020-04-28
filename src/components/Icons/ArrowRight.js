import * as React from "react";

function SvgArrowRight(props) {
  return (
    <svg width={10} height={12} {...props}>
      <defs>
        <path
          d="M749.27 139.309l4.597 7.15a1 1 0 01-.842 1.541h-9.193a1 1 0 01-.842-1.54l4.597-7.151a1 1 0 011.683 0z"
          id="ArrowRight_svg__a"
        />
      </defs>
      <use
        fill="currentColor"
        transform="rotate(90 445.429 -297)"
        xlinkHref="#ArrowRight_svg__a"
        fillRule="evenodd"
      />
    </svg>
  );
}

export default SvgArrowRight;
