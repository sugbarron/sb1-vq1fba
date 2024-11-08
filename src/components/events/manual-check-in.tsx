"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Employee } from "@/types/employee"
import { Search, UserCheck, Users } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface ManualCheckInProps {
  eventId: string
  onCheckIn: (employeeId: string) => void
  onBulkCheckIn: (employeeIds: string[]) => void
}

export function ManualCheckIn({ eventId, onCheckIn, onBulkCheckIn }: ManualCheckInProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])

  const { data: employees, isLoading } = useQuery({
    queryKey: ["eventParticipants", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/participants`)
      if (!response.ok) {
        throw new Error("Failed to fetch participants")
      }
      return response.json()
    },
  })

  const filteredEmployees = employees?.filter((employee: Employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const eligibleEmployees = filteredEmployees
        ?.filter((employee: any) => !employee.checkedIn)
        .map((employee: any) => employee._id) || []
      setSelectedEmployees(eligibleEmployees)
    } else {
      setSelectedEmployees([])
    }
  }

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId])
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId))
    }
  }

  const handleBulkCheckIn = () => {
    if (selectedEmployees.length > 0) {
      onBulkCheckIn(selectedEmployees)
      setSelectedEmployees([])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {selectedEmployees.length > 0 && (
          <Button onClick={handleBulkCheckIn}>
            <Users className="h-4 w-4 mr-2" />
            Check In ({selectedEmployees.length})
          </Button>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedEmployees.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees?.map((employee: any) => (
              <TableRow key={employee._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedEmployees.includes(employee._id)}
                    onCheckedChange={(checked) => 
                      handleSelectEmployee(employee._id, checked as boolean)
                    }
                    disabled={employee.checkedIn}
                  />
                </TableCell>
                <TableCell>{employee.employeeId}</TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      employee.checkedIn
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {employee.checkedIn ? "Checked In" : "Not Checked In"}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCheckIn(employee._id)}
                    disabled={employee.checkedIn}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}