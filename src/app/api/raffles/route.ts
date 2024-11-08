import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Raffle from "@/models/Raffle"
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
    const raffles = await Raffle.find()
      .populate("participants.employeeId")
      .populate("eventId")
      .lean()

    const serializedRaffles = serializeDocuments(raffles)
    return NextResponse.json(serializedRaffles)
  } catch (error) {
    console.error("Error fetching raffles:", error)
    return NextResponse.json(
      { message: "Error fetching raffles" },
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

    // Create the raffle
    const raffle = await Raffle.create({
      ...data,
      status: "active",
    })

    // If an event ID is provided, update the event with the raffle ID
    if (data.eventId) {
      await Event.findByIdAndUpdate(data.eventId, {
        raffleId: raffle._id,
      })
    }

    const populatedRaffle = await raffle.populate([
      "participants.employeeId",
      "eventId",
    ])

    const serializedRaffle = serializeDocument(populatedRaffle.toObject())
    return NextResponse.json(serializedRaffle, { status: 201 })
  } catch (error) {
    console.error("Error creating raffle:", error)
    return NextResponse.json(
      { message: "Error creating raffle" },
      { status: 500 }
    )
  }
}