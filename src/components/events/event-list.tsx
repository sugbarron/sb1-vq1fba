"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, ArrowRight, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

interface EventListProps {
  events?: any[]
  isLoading: boolean
}

export function EventList({ events, isLoading }: EventListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!events?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay eventos</h3>
          <p className="text-muted-foreground">
            Crea tu primer evento para comenzar
          </p>
        </CardContent>
      </Card>
    )
  }

  const getEventStatus = (date: string) => {
    const eventDate = new Date(date)
    const now = new Date()
    
    if (eventDate > now) {
      return { label: "Próximo", variant: "default" as const }
    } else if (eventDate.toDateString() === now.toDateString()) {
      return { label: "Hoy", variant: "secondary" as const }
    } else {
      return { label: "Finalizado", variant: "outline" as const }
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => {
        const status = getEventStatus(event.date)
        const checkedInCount = event.participants?.filter((p: any) => p.checkedIn)?.length || 0
        const totalParticipants = event.participants?.length || 0

        return (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{totalParticipants} registrados</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <QrCode className="h-4 w-4 mr-2" />
                      <span>{checkedInCount} check-ins</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Link href={`/dashboard/events/${event._id}/check-in`}>
                      <Button variant="outline" size="sm">
                        <QrCode className="h-4 w-4 mr-2" />
                        Check-in
                      </Button>
                    </Link>
                    <Link href={`/dashboard/events/${event._id}`}>
                      <Button variant="ghost" size="sm">
                        Ver detalles
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}