"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ParticipantList } from "@/components/raffles/participant-list"
import { Button } from "@/components/ui/button"
import { UserPlus, Mail } from "lucide-react"
import { useState } from "react"
import { AddParticipantsDialog } from "@/components/raffles/add-participants-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function RaffleParticipantsPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const { data: raffle, isLoading } = useQuery({
    queryKey: ["raffle", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/raffles/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch raffle")
      }
      return response.json()
    },
  })

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ employeeId, attended }: { employeeId: string; attended: boolean }) => {
      const response = await fetch(`/api/raffles/${params.id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, attended }),
      })
      if (!response.ok) {
        throw new Error("Failed to update attendance")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["raffle", params.id])
    },
  })

  const sendRemindersMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/raffles/${params.id}/remind`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to send reminders")
      }
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Reminders Sent",
        description: "Email reminders have been sent to all absent participants.",
      })
    },
  })

  const handleAttendanceChange = (employeeId: string, attended: boolean) => {
    updateAttendanceMutation.mutate({ employeeId, attended })
  }

  const handleSendReminders = () => {
    sendRemindersMutation.mutate()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Participants - {raffle.name}</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleSendReminders}
            disabled={sendRemindersMutation.isLoading}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Participants
          </Button>
        </div>
      </div>

      <ParticipantList
        participants={raffle.participants}
        onAttendanceChange={handleAttendanceChange}
        isActive={raffle.status === "active"}
      />

      <AddParticipantsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        raffleId={params.id}
        existingParticipants={raffle.participants.map(p => p.employeeId._id)}
      />
    </div>
  )
}