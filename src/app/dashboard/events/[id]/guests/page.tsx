"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { GuestList } from "@/components/events/guest-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX } from "lucide-react"
import { motion } from "framer-motion"

export default function EventGuestsPage() {
  const params = useParams()

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/events/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch event")
      }
      return response.json()
    },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const stats = {
    totalGuests: event.guests?.length || 0,
    confirmedGuests: event.guests?.filter((g: any) => g.status === "confirmed").length || 0,
    declinedGuests: event.guests?.filter((g: any) => g.status === "declined").length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Event Guests</h1>
        <p className="text-muted-foreground">{event.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Guests
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGuests}</div>
              <p className="text-xs text-muted-foreground">
                invited guests
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Confirmed
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmedGuests}</div>
              <p className="text-xs text-muted-foreground">
                confirmed attendance
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Declined
              </CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.declinedGuests}</div>
              <p className="text-xs text-muted-foreground">
                declined invitation
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <GuestList eventId={params.id} />
    </div>
  )
}