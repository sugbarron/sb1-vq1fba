"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { QRScanner } from "@/components/qr/qr-scanner"
import { ManualCheckIn } from "@/components/events/manual-check-in"
import { ExportAttendance } from "@/components/events/export-attendance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, QrCode, UserCheck } from "lucide-react"

interface ScanData {
  eventId: string
  employeeId: string
}

export default function CheckInPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [lastScanned, setLastScanned] = useState<string | null>(null)

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

  const checkInMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const response = await fetch(`/api/events/${params.id}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to check in")
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["event", params.id])
      queryClient.invalidateQueries(["eventParticipants", params.id])
      toast({
        title: "Check-in Successful",
        description: `${data.employee.name} has been checked in.`,
      })
      setLastScanned(data.employee.name)
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const bulkCheckInMutation = useMutation({
    mutationFn: async (employeeIds: string[]) => {
      const response = await fetch(`/api/events/${params.id}/bulk-check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeIds }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to check in")
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["event", params.id])
      queryClient.invalidateQueries(["eventParticipants", params.id])
      toast({
        title: "Bulk Check-in Successful",
        description: `${data.count} participants have been checked in.`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk Check-in Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleScan = (scanData: ScanData) => {
    if (scanData.eventId !== params.id) {
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not valid for this event.",
        variant: "destructive",
      })
      return
    }

    checkInMutation.mutate(scanData.employeeId)
  }

  const handleManualCheckIn = (employeeId: string) => {
    checkInMutation.mutate(employeeId)
  }

  const handleBulkCheckIn = (employeeIds: string[]) => {
    bulkCheckInMutation.mutate(employeeIds)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Event Check-in</h1>
          <p className="text-gray-500">{event.name}</p>
        </div>
        <ExportAttendance eventId={params.id} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Check-in Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qr">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Manual
                </TabsTrigger>
              </TabsList>
              <TabsContent value="qr" className="mt-4">
                <QRScanner onScan={handleScan} />
              </TabsContent>
              <TabsContent value="manual" className="mt-4">
                <ManualCheckIn
                  eventId={params.id}
                  onCheckIn={handleManualCheckIn}
                  onBulkCheckIn={handleBulkCheckIn}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            {lastScanned && (
              <div className="text-lg font-medium text-green-600">
                Last checked in: {lastScanned}
              </div>
            )}
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Total checked in: {event.checkedInCount || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}