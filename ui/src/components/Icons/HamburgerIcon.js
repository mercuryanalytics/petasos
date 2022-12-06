import * as React from "react";

function HamburgerIcon(props) {
    return (
        <svg viewBox="0 0 100 80" width={20} height={20} {...props}>
            <rect width="100" height="20"></rect>
            <rect y="30" width="100" height="20"></rect>
            <rect y="60" width="100" height="20"></rect>
        </svg>
    );
}

export default HamburgerIcon;
