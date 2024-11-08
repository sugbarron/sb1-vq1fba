"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { RaffleWheel } from "@/components/raffles/raffle-wheel"
import { PrizeList } from "@/components/raffles/prize-list"
import { WinnerDisplay } from "@/components/raffles/winner-display"

export default function RafflePage() {
  const params = useParams()
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState(null)
  const [claimTimer, setClaimTimer] = useState(30)

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

  const startRaffle = async () => {
    setSpinning(true)
    try {
      const response = await fetch(`/api/raffles/${params.id}/draw`, {
        method: "POST",
      })
      const data = await response.json()
      
      // Simulate wheel spinning for 3 seconds before showing winner
      setTimeout(() => {
        setSpinning(false)
        setWinner(data.winner)
        startClaimTimer()
      }, 3000)
    } catch (error) {
      console.error("Error drawing winner:", error)
      setSpinning(false)
    }
  }

  const startClaimTimer = () => {
    setClaimTimer(30)
    const timer = setInterval(() => {
      setClaimTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleNoClaim()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleClaim = async () => {
    try {
      await fetch(`/api/raffles/${params.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimed: true }),
      })
      setWinner(null)
    } catch (error) {
      console.error("Error claiming prize:", error)
    }
  }

  const handleNoClaim = async () => {
    try {
      await fetch(`/api/raffles/${params.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimed: false }),
      })
      setWinner(null)
    } catch (error) {
      console.error("Error handling no claim:", error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{raffle.name}</h1>
        <Button
          onClick={startRaffle}
          disabled={spinning || winner}
        >
          {spinning ? "Drawing..." : "Start Raffle"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <RaffleWheel spinning={spinning} />
          {winner && (
            <WinnerDisplay
              winner={winner}
              timeLeft={claimTimer}
              onClaim={handleClaim}
            />
          )}
        </div>
        <PrizeList prizes={raffle.prizes} />
      </div>
    </div>
  )
}