import * as React from "react";

function SvgArrowLeftCircle(props) {
  return (
    <svg width={22} height={22} {...props}>
      <defs>
        <path
          d="M129 132c6.075 0 11 4.925 11 11s-4.925 11-11 11-11-4.925-11-11 4.925-11 11-11zm0 1c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm-2.25 5.669c.185.2.205.51.061.735l-.061.08-2.714 2.939h10.432c.294 0 .532.259.532.577 0 .318-.238.576-.532.576h-10.433l2.715 2.94c.185.2.205.51.061.735l-.061.08a.502.502 0 01-.679.067l-.073-.067L122 143l3.998-4.331a.503.503 0 01.752 0z"
          id="ArrowLeftCircle_svg__a"
        />
      </defs>
      <use
        fill="#333"
        fillRule="nonzero"
        xlinkHref="#ArrowLeftCircle_svg__a"
        transform="translate(-118 -132)"
      />
    </svg>
  );
}

export default SvgArrowLeftCircle;
