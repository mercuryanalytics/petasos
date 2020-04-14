import * as React from "react";

function SvgArrowRightCircle(props) {
  return (
    <svg width={22} height={22} {...props}>
      <defs>
        <path
          d="M83 132c6.075 0 11 4.925 11 11s-4.925 11-11 11-11-4.925-11-11 4.925-11 11-11zm0 1c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm2.929 5.602l.073.067L90 143l-3.998 4.331a.503.503 0 01-.752 0 .613.613 0 01-.061-.735l.061-.08 2.714-2.939H77.532c-.294 0-.532-.259-.532-.577 0-.318.238-.576.532-.576h10.433l-2.715-2.94a.613.613 0 01-.061-.735l.061-.08a.502.502 0 01.679-.067z"
          id="ArrowRightCircle_svg__a"
        />
      </defs>
      <use
        fill="#333"
        fillRule="nonzero"
        xlinkHref="#ArrowRightCircle_svg__a"
        transform="translate(-72 -132)"
      />
    </svg>
  );
}

export default SvgArrowRightCircle;
