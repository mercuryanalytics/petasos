import * as React from "react";

function SvgClose(props) {
  return (
    <svg width={12} height={12} {...props}>
      <defs>
        <path
          d="M468 136l-.001 6H474v2h-6.001l.001 6h-2l-.001-6.001L460 144v-2l5.999-.001L466 136h2z"
          id="Close_svg__a"
        />
      </defs>
      <use
        fill="#333"
        transform="rotate(45 401.874 -481.976)"
        xlinkHref="#Close_svg__a"
        fillRule="evenodd"
      />
    </svg>
  );
}

export default SvgClose;
