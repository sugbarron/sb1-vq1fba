"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Employee } from "@/types/employee"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AddParticipantsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  raffleId: string
  existingParticipants: string[]
}

export function AddParticipantsDialog({
  open,
  onOpenChange,
  raffleId,
  existingParticipants,
}: AddParticipantsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const queryClient = useQueryClient()

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees")
      if (!response.ok) {
        throw new Error("Failed to fetch employees")
      }
      return response.json()
    },
  })

  const addParticipantsMutation = useMutation({
    mutationFn: async (employeeIds: string[]) => {
      const response = await fetch(`/api/raffles/${raffleId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeIds }),
      })
      if (!response.ok) {
        throw new Error("Failed to add participants")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["raffle", raffleId])
      setSelectedEmployees([])
      onOpenChange(false)
    },
  })

  const filteredEmployees = employees?.filter(
    (employee: Employee) =>
      !existingParticipants.includes(employee._id) &&
      (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSubmit = () => {
    if (selectedEmployees.length > 0) {
      addParticipantsMutation.mutate(selectedEmployees)
    }
  }

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Participants</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="border rounded-md max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees?.map((employee: Employee) => (
                  <TableRow
                    key={employee._id}
                    className="cursor-pointer"
                    onClick={() => toggleEmployee(employee._id)}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee._id)}
                        onChange={() => toggleEmployee(employee._id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>{employee.employeeId}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedEmployees.length === 0 || addParticipantsMutation.isLoading}
            >
              {addParticipantsMutation.isLoading ? "Adding..." : "Add Selected"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}