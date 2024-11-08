import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Raffle from "@/models/Raffle"
import { sendParticipantInvitation } from "@/lib/email"
import QRCode from "qrcode"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { employeeIds } = await req.json()
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

    const newParticipants = await Promise.all(
      employeeIds.map(async (id: string) => {
        const participant = {
          employeeId: id,
          attended: false,
          wonPrize: false,
        }

        // Generate QR code for the participant
        const qrData = JSON.stringify({
          raffleId: raffle._id,
          employeeId: id,
        })
        const qrCode = await QRCode.toDataURL(qrData)

        // Send invitation email
        const employee = await Employee.findById(id)
        if (employee) {
          await sendParticipantInvitation(
            employee.email,
            employee.name,
            raffle.name,
            new Date(raffle.eventId.date).toLocaleDateString(),
            qrCode
          )
        }

        return participant
      })
    )

    raffle.participants.push(...newParticipants)
    await raffle.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding participants:", error)
    return NextResponse.json(
      { message: "Error adding participants" },
      { status: 500 }
    )
  }
}