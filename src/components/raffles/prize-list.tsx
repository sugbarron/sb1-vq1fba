"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { PrizeDialog } from "./prize-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Plus, Trophy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Prize {
  _id: string
  name: string
  description: string
  tier: "platinum" | "gold" | "silver" | "bronze"
  value: number
  claimed: boolean
  winner?: {
    name: string
    department: string
  }
}

interface PrizeListProps {
  raffleId: string
  prizes: Prize[]
  isActive: boolean
}

const TIER_COLORS = {
  platinum: "bg-slate-300",
  gold: "bg-yellow-300",
  silver: "bg-gray-300",
  bronze: "bg-amber-600",
}

export function PrizeList({ raffleId, prizes, isActive }: PrizeListProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const deletePrizeMutation = useMutation({
    mutationFn: async (prizeId: string) => {
      const response = await fetch(`/api/raffles/${raffleId}/prizes/${prizeId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete prize")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["raffle", raffleId])
      toast({
        title: "Prize deleted",
        description: "The prize has been removed from the raffle.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete prize.",
        variant: "destructive",
      })
    },
  })

  const handleEdit = (prize: Prize) => {
    setSelectedPrize(prize)
    setDialogOpen(true)
  }

  const handleDelete = (prizeId: string) => {
    if (confirm("Are you sure you want to delete this prize?")) {
      deletePrizeMutation.mutate(prizeId)
    }
  }

  const handleAddNew = () => {
    setSelectedPrize(null)
    setDialogOpen(true)
  }

  // Group prizes by tier
  const groupedPrizes = prizes.reduce((acc, prize) => {
    if (!acc[prize.tier]) {
      acc[prize.tier] = []
    }
    acc[prize.tier].push(prize)
    return acc
  }, {} as Record<string, Prize[]>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Prizes</h2>
        {isActive && (
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Prize
          </Button>
        )}
      </div>

      {["platinum", "gold", "silver", "bronze"].map((tier) => {
        if (!groupedPrizes[tier]?.length) return null

        return (
          <div key={tier} className="space-y-4">
            <h3 className="text-lg font-medium capitalize flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${TIER_COLORS[tier]}`} />
              {tier}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {groupedPrizes[tier].map((prize) => (
                <Card key={prize._id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Gift className="h-4 w-4" />
                        <span>{prize.name}</span>
                      </div>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        ${prize.value.toFixed(2)}
                      </span>
                      <Badge variant={prize.claimed ? "default" : "secondary"}>
                        {prize.claimed ? "Claimed" : "Available"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">{prize.description}</p>
                    {prize.winner && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>
                          Winner: {prize.winner.name} ({prize.winner.department})
                        </span>
                      </div>
                    )}
                    {isActive && !prize.claimed && (
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(prize)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(prize._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      <PrizeDialog
        raffleId={raffleId}
        prize={selectedPrize}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}