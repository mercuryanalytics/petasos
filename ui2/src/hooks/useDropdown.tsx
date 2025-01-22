import { PrimitiveAtom, useAtom } from "jotai"

// TODO: Modify this method later when using several list items

const useDropdown = (rotateAtom: PrimitiveAtom<number>, showMenuAtom: PrimitiveAtom<boolean>) => {
  const [rotate, setRotate] = useAtom(rotateAtom)
  const [showMenu, setShowMenu] = useAtom(showMenuAtom)

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
