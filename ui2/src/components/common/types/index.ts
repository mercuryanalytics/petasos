export type MenuItem = {
  type: string
  title: string
  reference: string | null
  children: MenuItem[] | []
}
