import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Raffle from "@/models/Raffle"
import { sendReminderEmail } from "@/lib/email"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const raffle = await Raffle.findById(params.id)
      .populate({
        path: "eventId",
        select: "date",
      })
      .populate({
        path: "participants.employeeId",
        select: "name email",
      })

    if (!raffle) {
      return NextResponse.json(
        { message: "Raffle not found" },
        { status: 404 }
      )
    }

    // Send reminder emails to all participants who haven't checked in yet
    const reminderPromises = raffle.participants
      .filter((p) => !p.attended)
      .map((participant) => 
        sendReminderEmail(
          participant.employeeId.email,
          participant.employeeId.name,
          raffle.name,
          new Date(raffle.eventId.date).toLocaleDateString()
        )
      )

    await Promise.all(reminderPromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending reminders:", error)
    return NextResponse.json(
      { message: "Error sending reminders" },
      { status: 500 }
    )
  }
}