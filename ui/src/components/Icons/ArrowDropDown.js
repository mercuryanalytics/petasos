import * as React from "react";

function SvgArrowDropDown(props) {
  return (
    <svg width={14} height={8} {...props}>
      <defs>
        <path
          d="M420.22 139.22a.75.75 0 01.976-.073l.084.073 5.655 5.654 5.655-5.654a.75.75 0 01.977-.073l.084.073a.75.75 0 01.072.976l-.072.084-6.716 6.716-6.715-6.716a.75.75 0 010-1.06z"
          id="ArrowDropDown_svg__a"
        />
      </defs>
      <use
        fill="currentColor"
        fillRule="nonzero"
        xlinkHref="#ArrowDropDown_svg__a"
        transform="translate(-420 -139)"
      />
    </svg>
  );
}

export default SvgArrowDropDown;
