import * as React from "react";

function SvgInfoFill(props) {
  return (
    <svg width={20} height={20} {...props}>
      <defs>
        <path
          d="M787 133c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10zm.5 9h-1a.5.5 0 00-.5.5v7a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-7a.5.5 0 00-.5-.5zm-.5-5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
          id="InfoFill_svg__a"
        />
      </defs>
      <use
        fill="currentColor"
        fillRule="nonzero"
        xlinkHref="#InfoFill_svg__a"
        transform="translate(-777 -133)"
      />
    </svg>
  );
}

export default SvgInfoFill;
