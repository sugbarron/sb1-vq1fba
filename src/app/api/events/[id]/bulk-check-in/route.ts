import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Event from "@/models/Event"
import Raffle from "@/models/Raffle"

export async function POST(
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

    const { employeeIds } = await req.json()
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json(
        { message: "Invalid employee IDs" },
        { status: 400 }
      )
    }

    await dbConnect()
    const event = await Event.findById(params.id)
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    // Update check-in status for all employees
    let checkedInCount = 0
    employeeIds.forEach(employeeId => {
      const participantIndex = event.participants.findIndex(
        (p) => p.employeeId.toString() === employeeId && !p.checkedIn
      )
      if (participantIndex !== -1) {
        event.participants[participantIndex].checkedIn = true
        event.participants[participantIndex].checkInTime = new Date()
        checkedInCount++
      }
    })

    await event.save()

    // If event has a raffle, update participant attendance
    if (event.raffleId) {
      const raffle = await Raffle.findById(event.raffleId)
      if (raffle) {
        employeeIds.forEach(employeeId => {
          const raffleParticipantIndex = raffle.participants.findIndex(
            (p) => p.employeeId.toString() === employeeId
          )
          if (raffleParticipantIndex !== -1) {
            raffle.participants[raffleParticipantIndex].attended = true
          }
        })
        await raffle.save()
      }
    }

    return NextResponse.json({
      success: true,
      count: checkedInCount,
    })
  } catch (error) {
    console.error("Error bulk checking in:", error)
    return NextResponse.json(
      { message: "Error bulk checking in" },
      { status: 500 }
    )
  }
}