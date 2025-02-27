import React from "react"
import { ListBoxItem, ListBoxItemProps } from "react-aria-components"

const Item: React.FC<ListBoxItemProps> = ({ ...props }) => <ListBoxItem {...props} />

export default Item
