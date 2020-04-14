import * as React from "react";

function SvgFile(props) {
  return (
    <svg width={14} height={18} {...props}>
      <defs>
        <path
          d="M634.755 134l4.245 4.57v11.93a1.5 1.5 0 01-1.5 1.5h-11a1.5 1.5 0 01-1.5-1.5v-15a1.5 1.5 0 011.5-1.5h8.255zm-.735 1h-7.52a.5.5 0 00-.5.5v15a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-11.234h-3.98V135zm3.333 3.266l-2.333-2.511v2.511h2.333z"
          id="File_svg__a"
        />
      </defs>
      <use
        fill="#333"
        fillRule="nonzero"
        xlinkHref="#File_svg__a"
        transform="translate(-625 -134)"
      />
    </svg>
  );
}

export default SvgFile;
