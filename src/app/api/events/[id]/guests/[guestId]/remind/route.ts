import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Event from "@/models/Event"
import Guest from "@/models/Guest"
import { sendEventReminder } from "@/lib/email"

export async function POST(
  req: Request,
  { params }: { params: { id: string; guestId: string } }
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
    const guest = await Guest.findById(params.guestId)

    if (!event || !guest) {
      return NextResponse.json(
        { message: "Event or guest not found" },
        { status: 404 }
      )
    }

    // Send reminder email
    await sendEventReminder(
      guest.email,
      guest.name,
      event.name,
      new Date(event.date).toLocaleDateString(),
      event.location
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending reminder:", error)
    return NextResponse.json(
      { message: "Error sending reminder" },
      { status: 500 }
    )
  }
}