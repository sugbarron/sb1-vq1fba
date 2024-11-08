import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Event from "@/models/Event"
import { serializeDocuments } from "@/lib/utils"

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
    const event = await Event.findById(params.id)
      .populate({
        path: "guests.guestId",
        populate: {
          path: "employeeId",
          model: "Employee",
        },
      })
      .lean()

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    // Filter to only show checked-in guests
    const participants = event.guests.filter(guest => guest.checkedIn)
    const serializedParticipants = serializeDocuments(participants)

    return NextResponse.json(serializedParticipants)
  } catch (error) {
    console.error("Error fetching participants:", error)
    return NextResponse.json(
      { message: "Error fetching participants" },
      { status: 500 }
    )
  }
}

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
      g => g.guestId.toString() === guestId
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
          p => p.employeeId.toString() === event.guests[guestIndex].guestId.employeeId?.toString()
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
    console.error("Error updating participant:", error)
    return NextResponse.json(
      { message: "Error updating participant" },
      { status: 500 }
    )
  }
}