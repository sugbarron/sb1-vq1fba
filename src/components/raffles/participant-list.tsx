"use client"

import { useState } from "react"
import { Employee } from "@/types/employee"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Check, X } from "lucide-react"

interface Participant {
  employeeId: Employee
  attended: boolean
  wonPrize: boolean
}

interface ParticipantListProps {
  participants: Participant[]
  onAttendanceChange: (employeeId: string, attended: boolean) => void
  isActive: boolean
}

export function ParticipantList({ participants, onAttendanceChange, isActive }: ParticipantListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredParticipants = participants?.filter((participant) =>
    participant.employeeId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.employeeId.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search participants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-gray-500">
          Total: {participants?.length || 0}
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants?.map((participant) => (
              <TableRow key={participant.employeeId._id}>
                <TableCell>{participant.employeeId.employeeId}</TableCell>
                <TableCell>{participant.employeeId.name}</TableCell>
                <TableCell>{participant.employeeId.department}</TableCell>
                <TableCell>
                  {participant.wonPrize ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Won Prize
                    </span>
                  ) : participant.attended ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Present
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Not Present
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!isActive || participant.wonPrize}
                    onClick={() => onAttendanceChange(participant.employeeId._id, !participant.attended)}
                  >
                    {participant.attended ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
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