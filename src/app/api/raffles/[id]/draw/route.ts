import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Raffle from "@/models/Raffle"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const raffle = await Raffle.findById(params.id)
      .populate("participants.employeeId")

    if (!raffle) {
      return NextResponse.json(
        { message: "Raffle not found" },
        { status: 404 }
      )
    }

    // Get eligible participants (attended and haven't won)
    const eligibleParticipants = raffle.participants.filter(
      (p) => p.attended && !p.wonPrize
    )

    if (eligibleParticipants.length === 0) {
      return NextResponse.json(
        { message: "No eligible participants" },
        { status: 400 }
      )
    }

    // Select random winner
    const winnerIndex = Math.floor(Math.random() * eligibleParticipants.length)
    const winner = eligibleParticipants[winnerIndex]

    return NextResponse.json({ winner: winner.employeeId })
  } catch (error) {
    console.error("Error drawing winner:", error)
    return NextResponse.json(
      { message: "Error drawing winner" },
      { status: 500 }
    )
  }
}