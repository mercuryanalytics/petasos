import * as React from "react";

function SvgUpload(props) {
  return (
    <svg width={19} height={17} {...props}>
      <defs>
        <path
          d="M165 148.5v2h16.83v-2h1v3H164v-3h1zm8.267-13.5l4.331 4.305a.57.57 0 010 .81c-.2.2-.51.221-.735.067l-.08-.067-2.94-2.922v10.234a.574.574 0 01-.576.573.574.574 0 01-.576-.573v-10.235l-2.94 2.923c-.2.2-.511.221-.736.067l-.08-.067a.57.57 0 01-.066-.73l.067-.08 4.33-4.305z"
          id="Upload_svg__a"
        />
      </defs>
      <use
        fill="#333"
        fillRule="nonzero"
        xlinkHref="#Upload_svg__a"
        transform="translate(-164 -135)"
      />
    </svg>
  );
}

export default SvgUpload;
