import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Raffle from "@/models/Raffle"

export async function PUT(
  req: Request,
  { params }: { params: { id: string; prizeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, description } = await req.json()
    await dbConnect()

    const raffle = await Raffle.findById(params.id)
    if (!raffle) {
      return NextResponse.json(
        { message: "Raffle not found" },
        { status: 404 }
      )
    }

    const prize = raffle.prizes.id(params.prizeId)
    if (!prize) {
      return NextResponse.json(
        { message: "Prize not found" },
        { status: 404 }
      )
    }

    if (prize.claimed) {
      return NextResponse.json(
        { message: "Cannot modify claimed prize" },
        { status: 400 }
      )
    }

    prize.name = name
    prize.description = description
    await raffle.save()

    return NextResponse.json(prize)
  } catch (error) {
    console.error("Error updating prize:", error)
    return NextResponse.json(
      { message: "Error updating prize" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; prizeId: string } }
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
    const raffle = await Raffle.findById(params.id)
    if (!raffle) {
      return NextResponse.json(
        { message: "Raffle not found" },
        { status: 404 }
      )
    }

    const prize = raffle.prizes.id(params.prizeId)
    if (!prize) {
      return NextResponse.json(
        { message: "Prize not found" },
        { status: 404 }
      )
    }

    if (prize.claimed) {
      return NextResponse.json(
        { message: "Cannot delete claimed prize" },
        { status: 400 }
      )
    }

    prize.remove()
    await raffle.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prize:", error)
    return NextResponse.json(
      { message: "Error deleting prize" },
      { status: 500 }
    )
  }
}