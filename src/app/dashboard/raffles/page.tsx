"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { RaffleList } from "@/components/raffles/raffle-list"
import { RaffleDialog } from "@/components/raffles/raffle-dialog"
import { Plus, Gift, Users, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function RafflesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: raffles, isLoading } = useQuery({
    queryKey: ["raffles"],
    queryFn: async () => {
      const response = await fetch("/api/raffles")
      if (!response.ok) {
        throw new Error("Failed to fetch raffles")
      }
      return response.json()
    },
  })

  const stats = {
    activeRaffles: raffles?.filter((r: any) => r.status === "active").length || 0,
    totalParticipants: raffles?.reduce((acc: number, r: any) => acc + (r.participants?.length || 0), 0) || 0,
    totalPrizes: raffles?.reduce((acc: number, r: any) => acc + (r.prizes?.length || 0), 0) || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Sorteos</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Sorteo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sorteos Activos
              </CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRaffles}</div>
              <p className="text-xs text-muted-foreground">
                de {raffles?.length || 0} sorteos totales
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
                Participantes Totales
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
              <p className="text-xs text-muted-foreground">
                en todos los sorteos
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
                Premios Disponibles
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPrizes}</div>
              <p className="text-xs text-muted-foreground">
                premios por entregar
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <RaffleList raffles={raffles} isLoading={isLoading} />
      <RaffleDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}