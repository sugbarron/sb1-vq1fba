import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Raffle from "@/models/Raffle"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { employeeId, attended } = await req.json()
    await dbConnect()
    
    const raffle = await Raffle.findById(params.id)
    if (!raffle) {
      return NextResponse.json(
        { message: "Raffle not found" },
        { status: 404 }
      )
    }

    const participantIndex = raffle.participants.findIndex(
      (p) => p.employeeId.toString() === employeeId
    )

    if (participantIndex === -1) {
      return NextResponse.json(
        { message: "Participant not found" },
        { status: 404 }
      )
    }

    raffle.participants[participantIndex].attended = attended
    await raffle.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating attendance:", error)
    return NextResponse.json(
      { message: "Error updating attendance" },
      { status: 500 }
    )
  }
}