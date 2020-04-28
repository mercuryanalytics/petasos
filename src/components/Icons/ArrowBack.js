import * as React from "react";

function SvgArrowBack(props) {
  return (
    <svg width={21} height={14} {...props}>
      <defs>
        <path
          d="M214.673 136.263a.926.926 0 01.1 1.143l-.1.124-4.384 4.573h16.852c.474 0 .859.402.859.897s-.385.896-.86.896h-16.852l4.385 4.574a.926.926 0 01.1 1.143l-.1.124a.833.833 0 01-1.096.104l-.119-.104L207 143l6.458-6.737a.834.834 0 011.215 0z"
          id="ArrowBack_svg__a"
        />
      </defs>
      <use
        fill="currentColor"
        fillRule="nonzero"
        xlinkHref="#ArrowBack_svg__a"
        transform="translate(-207 -136)"
      />
    </svg>
  );
}

export default SvgArrowBack;
