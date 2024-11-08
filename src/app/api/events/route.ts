import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Event from "@/models/Event"
import { serializeDocuments, serializeDocument } from "@/lib/utils"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    await dbConnect()
    const events = await Event.find()
      .populate("participants.employeeId")
      .populate("raffleId")
      .sort({ date: -1 })
      .lean()

    const serializedEvents = serializeDocuments(events)
    return NextResponse.json(serializedEvents)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { message: "Error fetching events" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await req.json()
    await dbConnect()

    const event = await Event.create({
      ...data,
      date: new Date(data.date),
    })

    const populatedEvent = await event.populate([
      "participants.employeeId",
      "raffleId",
    ])

    const serializedEvent = serializeDocument(populatedEvent.toObject())
    return NextResponse.json(serializedEvent, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      { message: "Error creating event" },
      { status: 500 }
    )
  }
}