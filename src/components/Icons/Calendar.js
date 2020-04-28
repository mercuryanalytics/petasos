import * as React from "react";

function SvgCalendar(props) {
  return (
    <svg width={15} height={16} {...props}>
      <defs>
        <path
          d="M256.5 135v1h6v-1h1v1h2.5a1 1 0 011 1v13a1 1 0 01-1 1h-13a1 1 0 01-1-1v-13a1 1 0 011-1h2.5v-1h1zm9.5 6.008h-13V150h13v-8.992zM256.5 146v2h-2v-2h2zm4 0v2h-2v-2h2zm4 0v2h-2v-2h2zm-8-3.5v2h-2v-2h2zm4 0v2h-2v-2h2zm4 0v2h-2v-2h2zm-2-5.5h-6v1.642h-1V137H253v3.008h13V137h-2.5v1.642h-1V137z"
          id="Calendar_svg__a"
        />
      </defs>
      <use
        fill="currentColor"
        fillRule="nonzero"
        xlinkHref="#Calendar_svg__a"
        transform="translate(-252 -135)"
      />
    </svg>
  );
}

export default SvgCalendar;
