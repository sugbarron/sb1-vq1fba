import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Event from "@/models/Event"
import Raffle from "@/models/Raffle"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    await dbConnect()

    // Get events attended
    const events = await Event.find({
      "participants.employeeId": params.id,
      "participants.checkedIn": true,
    })
    .sort({ date: -1 })
    .limit(10)

    // Get raffle participations
    const raffles = await Raffle.find({
      "participants.employeeId": params.id,
      "participants.attended": true,
    })
    .sort({ createdAt: -1 })
    .limit(10)

    // Combine and format history
    const history = [
      ...events.map((event) => ({
        type: "event",
        title: event.name,
        date: event.date,
        description: "Asistió al evento",
      })),
      ...raffles.map((raffle) => {
        const participant = raffle.participants.find(
          (p) => p.employeeId.toString() === params.id
        )
        const prize = raffle.prizes.find(
          (p) => p.winner?.toString() === params.id
        )

        return {
          type: "raffle",
          title: raffle.name,
          date: raffle.createdAt,
          description: prize
            ? `Ganó ${prize.name}`
            : "Participó en el sorteo",
        }
      }),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(history)
  } catch (error) {
    console.error("Error fetching employee history:", error)
    return NextResponse.json(
      { message: "Error fetching employee history" },
      { status: 500 }
    )
  }
}