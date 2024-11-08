import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Raffle from "@/models/Raffle"
import { sendWinnerNotification } from "@/lib/email"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { claimed } = await req.json()
    await dbConnect()
    
    const raffle = await Raffle.findById(params.id)
      .populate("currentWinner", "name email")
      .populate("prizes")

    if (!raffle) {
      return NextResponse.json(
        { message: "Raffle not found" },
        { status: 404 }
      )
    }

    const prizeIndex = raffle.prizes.findIndex((p) => !p.claimed)
    if (prizeIndex === -1) {
      return NextResponse.json(
        { message: "No prizes available" },
        { status: 400 }
      )
    }

    if (claimed) {
      // Mark prize as claimed and participant as winner
      raffle.prizes[prizeIndex].claimed = true
      raffle.prizes[prizeIndex].winner = raffle.currentWinner
      
      const participantIndex = raffle.participants.findIndex(
        (p) => p.employeeId.toString() === raffle.currentWinner.toString()
      )
      if (participantIndex !== -1) {
        raffle.participants[participantIndex].wonPrize = true
      }

      // Send winner notification email
      await sendWinnerNotification(
        raffle.currentWinner.email,
        raffle.currentWinner.name,
        raffle.name,
        raffle.prizes[prizeIndex].name
      )
    } else {
      // Remove participant from current round only
      const participantIndex = raffle.participants.findIndex(
        (p) => p.employeeId.toString() === raffle.currentWinner.toString()
      )
      if (participantIndex !== -1) {
        raffle.participants[participantIndex].attended = false
      }
    }

    raffle.currentWinner = null
    await raffle.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling claim:", error)
    return NextResponse.json(
      { message: "Error handling claim" },
      { status: 500 }
    )
  }
}