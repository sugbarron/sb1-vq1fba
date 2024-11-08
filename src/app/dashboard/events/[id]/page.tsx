"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GuestList } from "@/components/events/guest-list"
import { ParticipantList } from "@/components/events/participant-list"
import { QRScanner } from "@/components/qr/qr-scanner"
import { Calendar, Users, QrCode, UserCheck } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function EventDetailsPage() {
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

  const stats = {
    totalGuests: event?.guests?.length || 0,
    checkedInGuests: event?.guests?.filter((g: any) => g.checkedIn).length || 0,
    confirmedGuests: event?.guests?.filter((g: any) => g.status === "confirmed").length || 0,
  }

  const handleQRScan = async (data: any) => {
    try {
      const response = await fetch(`/api/events/${params.id}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: data.guestId }),
      })

      if (!response.ok) {
        throw new Error("Failed to check in guest")
      }

      // Refetch event data to update the UI
      queryClient.invalidateQueries(["event", params.id])
    } catch (error) {
      console.error("Error checking in guest:", error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <p className="text-muted-foreground">
            {new Date(event.date).toLocaleDateString()}
          </p>
        </div>
        <Link href={`/dashboard/events/${params.id}/check-in`}>
          <Button>
            <QrCode className="h-4 w-4 mr-2" />
            Check-in Mode
          </Button>
        </Link>
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
                Checked In
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.checkedInGuests}</div>
              <p className="text-xs text-muted-foreground">
                guests checked in
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
                Confirmed
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmedGuests}</div>
              <p className="text-xs text-muted-foreground">
                confirmed attendance
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="guests">
            <TabsList>
              <TabsTrigger value="guests">
                <Users className="h-4 w-4 mr-2" />
                Guests
              </TabsTrigger>
              <TabsTrigger value="participants">
                <UserCheck className="h-4 w-4 mr-2" />
                Participants
              </TabsTrigger>
              <TabsTrigger value="qr">
                <QrCode className="h-4 w-4 mr-2" />
                QR Scanner
              </TabsTrigger>
            </TabsList>
            <TabsContent value="guests" className="mt-6">
              <GuestList eventId={params.id} />
            </TabsContent>
            <TabsContent value="participants" className="mt-6">
              <ParticipantList eventId={params.id} />
            </TabsContent>
            <TabsContent value="qr" className="mt-6">
              <div className="max-w-md mx-auto">
                <QRScanner onScan={handleQRScan} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}