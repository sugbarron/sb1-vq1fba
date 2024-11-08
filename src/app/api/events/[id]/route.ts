import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Event from "@/models/Event"
import { serializeDocument } from "@/lib/utils"

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
      .populate("participants.employeeId")
      .populate("raffleId")
      .lean()

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    const serializedEvent = serializeDocument(event)
    return NextResponse.json(serializedEvent)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json(
      { message: "Error fetching event" },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const data = await req.json()
    await dbConnect()

    const event = await Event.findByIdAndUpdate(
      params.id,
      {
        ...data,
        date: new Date(data.date),
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("participants.employeeId")
      .populate("raffleId")
      .lean()

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    const serializedEvent = serializeDocument(event)
    return NextResponse.json(serializedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      { message: "Error updating event" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const event = await Event.findByIdAndDelete(params.id)

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { message: "Error deleting event" },
      { status: 500 }
    )
  }
}