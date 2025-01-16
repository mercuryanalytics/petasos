import React from "react";

const ArrowRight: React.FC<{ rotate?: number }> = ({ rotate = 0 }) => (
  <svg
    stroke="black"
    fill="black"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    transform={`rotate(${rotate})`}
  >
    <path d="M8 5v14l11-7z"></path>
  </svg>
);

export default ArrowRight;
