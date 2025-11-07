export type MenuItem = {
  type: string
  title: string
  reference: number | null
  children: MenuItem[] | []
}
