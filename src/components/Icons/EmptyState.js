import * as React from "react";

function SvgEmptyState(props) {
  return (
    <svg width="193" height="auto" viewBox="0 0 193 145" {...props}>
      <defs>
        <path
          d="M38.575 0l4.833 8.564L70 8.568a6 6 0 015.973 5.422l.027.578V50a6 6 0 01-6 6H6a6 6 0 01-6-6V6a6 6 0 016-6h32.575zM72 23.642H4V50a2 2 0 001.85 1.995L6 52h64a2 2 0 002-2V23.642zM36.24 4H6a2 2 0 00-2 2v13.642h68v-5.074a2 2 0 00-1.85-1.995l-.15-.005H41.079L36.24 4z"
          id="EmptyState_svg__a"
        />
        <path
          d="M39.02 0L56 18.28V66a6 6 0 01-6 6H6a6 6 0 01-6-6V6a6 6 0 016-6h33.02zm-2.937 4H6a2 2 0 00-2 2v60a2 2 0 002 2h44a2 2 0 002-2V21.066H36.083V4zm3.999 3.021l-.002 10.043 9.332.001-9.33-10.044z"
          id="EmptyState_svg__c"
        />
      </defs>
      <g transform="translate(-4)" fill="#fff" fillRule="evenodd">
        <g transform="rotate(-15 170.534 11.03)">
          <g transform="translate(10 22)">
            <mask id="EmptyState_svg__b" fill="#fff">
              <use xlinkHref="#EmptyState_svg__a" />
            </mask>
            <use
              fill="#12BAC5"
              fillRule="nonzero"
              xlinkHref="#EmptyState_svg__a"
            />
            <g mask="url(#EmptyState_svg__b)" fill="#333">
              <path d="M-90-122h256v256H-90z" />
            </g>
          </g>
          <circle fill="#333" cx={30.5} cy={54.5} r={2.5} />
          <circle fill="#333" cx={65.5} cy={54.5} r={2.5} />
          <path
            d="M37 65.883c3.707-1.333 7.374-2 11-2 3.626 0 7.293.667 11 2"
            stroke="#333"
            strokeWidth={2}
          />
        </g>
        <path
          stroke="#333"
          strokeWidth={2}
          strokeLinecap="round"
          d="M6.84 58.186l9.412 5.038M14.05 54.184l4.709 5.985M5.753 65.724l8.504.827"
        />
        <g transform="rotate(15 -106.181 520.352)">
          <g transform="translate(20 12)">
            <mask id="EmptyState_svg__d" fill="#fff">
              <use xlinkHref="#EmptyState_svg__c" />
            </mask>
            <use
              fill="#12BAC5"
              fillRule="nonzero"
              xlinkHref="#EmptyState_svg__c"
            />
            <g mask="url(#EmptyState_svg__d)" fill="#333">
              <path d="M-100-112h256v256h-256z" />
            </g>
          </g>
          <circle fill="#333" cx={38.5} cy={45.5} r={2.5} />
          <circle fill="#333" cx={57.5} cy={45.5} r={2.5} />
          <path
            d="M41 59.883c2.36-1.333 4.692-2 7-2s4.64.667 7 2"
            stroke="#333"
            strokeWidth={2}
          />
        </g>
        <circle stroke="#333" opacity={0.2} cx={134} cy={34} r={4.5} />
        <circle stroke="#333" opacity={0.2} cx={73} cy={46.5} r={3} />
        <circle stroke="#333" opacity={0.2} cx={99.5} cy={32.5} r={3} />
        <circle stroke="#333" opacity={0.2} cx={103.5} cy={5.5} r={5} />
        <circle stroke="#333" opacity={0.2} cx={135.5} cy={66.5} r={3} />
        <circle stroke="#333" opacity={0.2} cx={116.5} cy={57.5} r={2} />
        <circle stroke="#333" opacity={0.2} cx={73.5} cy={26.5} r={2} />
        <circle stroke="#333" opacity={0.2} cx={33.5} cy={46.5} r={2} />
        <circle stroke="#333" opacity={0.2} cx={79.5} cy={115.5} r={3} />
      </g>
    </svg>
  );
}

export default SvgEmptyState;
