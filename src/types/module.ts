export interface Module {
  _id: string
  name: string
  displayName: string
  description?: string
  icon: string
  path: string
  status: "active" | "inactive"
  permissions: {
    action: string
    description: string
  }[]
  adminRoles: {
    _id: string
    name: string
    email: string
  }[]
  createdAt: Date
  updatedAt: Date
}