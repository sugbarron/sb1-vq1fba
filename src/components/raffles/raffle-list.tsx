"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Users, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

interface RaffleListProps {
  raffles?: any[]
  isLoading: boolean
}

export function RaffleList({ raffles, isLoading }: RaffleListProps) {
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

  if (!raffles?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Gift className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay sorteos</h3>
          <p className="text-muted-foreground">
            Crea tu primer sorteo para comenzar
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {raffles.map((raffle, index) => (
        <motion.div
          key={raffle._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{raffle.name}</CardTitle>
                <Badge variant={raffle.status === "active" ? "default" : "secondary"}>
                  {raffle.status === "active" ? "Activo" : "Finalizado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{raffle.participants?.length || 0} participantes</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Gift className="h-4 w-4 mr-2" />
                    <span>{raffle.prizes?.length || 0} premios</span>
                  </div>
                </div>

                {raffle.eventId && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      Evento: {raffle.eventId.name} ({new Date(raffle.eventId.date).toLocaleDateString()})
                    </span>
                  </div>
                )}

                <div className="flex justify-end">
                  <Link href={`/dashboard/raffles/${raffle._id}`}>
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
      ))}
    </div>
  )
}