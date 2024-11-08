export interface Employee {
  _id: string
  employeeId: string
  name: string
  email: string
  department: string
  position: string
  status: "active" | "inactive"
  raffleEligible: boolean
  raffleExclusionReason?: string
  joinDate: Date
  createdAt: Date
  updatedAt: Date
}