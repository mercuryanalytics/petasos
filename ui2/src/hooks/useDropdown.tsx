import { useState } from "react"

// TODO: Modify this method later when using several list items
const useDropdown = () => {
  const [rotate, setRotate] = useState(0)
  const [showMenu, setShowMenu] = useState(false)

  return {
    rotate,
    showMenu,
    setShowDropdown: () => {
      setRotate(prev => (prev === 0 ? 90 : 0))
      setShowMenu(prev => !prev)
    }
  }
}

export default useDropdown
