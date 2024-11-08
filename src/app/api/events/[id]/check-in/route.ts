import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Event from "@/models/Event"
import { serializeDocument } from "@/lib/utils"

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

    const { guestId } = await req.json()
    await dbConnect()

    const event = await Event.findById(params.id)
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    // Find the guest in the event
    const guestIndex = event.guests.findIndex(
      (g: any) => g.guestId.toString() === guestId
    )

    if (guestIndex === -1) {
      return NextResponse.json(
        { message: "Guest not found in event" },
        { status: 404 }
      )
    }

    // Update check-in status
    event.guests[guestIndex].checkedIn = true
    event.guests[guestIndex].checkInTime = new Date()
    await event.save()

    // If event has a raffle, update participant status
    if (event.raffleId) {
      const raffle = await Raffle.findById(event.raffleId)
      if (raffle) {
        const participant = raffle.participants.find(
          (p: any) => p.employeeId.toString() === event.guests[guestIndex].guestId.employeeId?.toString()
        )
        if (participant) {
          participant.attended = true
          await raffle.save()
        }
      }
    }

    const updatedEvent = await event.populate({
      path: "guests.guestId",
      populate: {
        path: "employeeId",
        model: "Employee",
      },
    })

    const serializedEvent = serializeDocument(updatedEvent.toObject())
    return NextResponse.json(serializedEvent)
  } catch (error) {
    console.error("Error checking in guest:", error)
    return NextResponse.json(
      { message: "Error checking in guest" },
      { status: 500 }
    )
  }
}