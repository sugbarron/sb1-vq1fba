"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"

interface ParticipantListProps {
  eventId: string
}

export function ParticipantList({ eventId }: ParticipantListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const { data: participants, isLoading } = useQuery({
    queryKey: ["eventParticipants", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/participants`)
      if (!response.ok) {
        throw new Error("Failed to fetch participants")
      }
      return response.json()
    },
  })

  const filteredParticipants = participants?.filter((participant: any) =>
    participant.guestId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.guestId.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search participants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Check-in Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants?.map((participant: any) => (
              <TableRow key={participant.guestId._id}>
                <TableCell>{participant.guestId.name}</TableCell>
                <TableCell>{participant.guestId.email}</TableCell>
                <TableCell>
                  <Badge variant={participant.guestId.type === "employee" ? "default" : "secondary"}>
                    {participant.guestId.type === "employee" ? "Employee" : "External"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {participant.checkInTime
                    ? new Date(participant.checkInTime).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={participant.checkedIn ? "default" : "secondary"}
                  >
                    {participant.checkedIn ? "Checked In" : "Not Checked In"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}