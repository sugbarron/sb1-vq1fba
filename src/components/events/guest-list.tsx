"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AddGuestsDialog } from "./add-guests-dialog"
import { UserPlus, Search, Mail } from "lucide-react"

interface GuestListProps {
  eventId: string
}

export function GuestList({ eventId }: GuestListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: guests, isLoading } = useQuery({
    queryKey: ["eventGuests", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/guests`)
      if (!response.ok) {
        throw new Error("Failed to fetch guests")
      }
      return response.json()
    },
  })

  const filteredGuests = guests?.filter((guest: any) =>
    guest.guestId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.guestId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (guest.guestId.organization || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendReminder = async (guestId: string) => {
    try {
      await fetch(`/api/events/${eventId}/guests/${guestId}/remind`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Error sending reminder:", error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Guest
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests?.map((guest: any) => (
              <TableRow key={guest.guestId._id}>
                <TableCell>{guest.guestId.name}</TableCell>
                <TableCell>
                  <Badge variant={guest.guestId.type === "employee" ? "default" : "secondary"}>
                    {guest.guestId.type === "employee" ? "Employee" : "External"}
                  </Badge>
                </TableCell>
                <TableCell>{guest.guestId.email}</TableCell>
                <TableCell>
                  {guest.guestId.type === "employee"
                    ? guest.guestId.employeeId?.department
                    : guest.guestId.organization || "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      guest.status === "confirmed"
                        ? "default"
                        : guest.status === "declined"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {guest.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSendReminder(guest.guestId._id)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddGuestsDialog
        eventId={eventId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}