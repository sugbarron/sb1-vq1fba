import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Event from "@/models/Event"
import Guest from "@/models/Guest"
import { sendEventInvitation } from "@/lib/email"
import QRCode from "qrcode"

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

    return NextResponse.json(event.guests)
  } catch (error) {
    console.error("Error fetching guests:", error)
    return NextResponse.json(
      { message: "Error fetching guests" },
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

    const data = await req.json()
    await dbConnect()

    const event = await Event.findById(params.id)
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    // Create or update guest
    const guest = await Guest.findOneAndUpdate(
      { email: data.email },
      { ...data },
      { upsert: true, new: true }
    )

    // Add guest to event if not already added
    const existingGuest = event.guests.find(
      (g: any) => g.guestId.toString() === guest._id.toString()
    )

    if (!existingGuest) {
      event.guests.push({
        guestId: guest._id,
        status: "pending",
      })
      await event.save()

      // Generate QR code for check-in
      const qrData = JSON.stringify({
        eventId: event._id,
        guestId: guest._id,
      })
      const qrCode = await QRCode.toDataURL(qrData)

      // Send invitation email
      await sendEventInvitation(
        guest.email,
        guest.name,
        event.name,
        new Date(event.date).toLocaleDateString(),
        event.location,
        qrCode
      )
    }

    return NextResponse.json(guest)
  } catch (error) {
    console.error("Error adding guest:", error)
    return NextResponse.json(
      { message: "Error adding guest" },
      { status: 500 }
    )
  }
}