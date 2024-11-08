import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Raffle from "@/models/Raffle"

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

    const { name, description } = await req.json()
    await dbConnect()

    const raffle = await Raffle.findById(params.id)
    if (!raffle) {
      return NextResponse.json(
        { message: "Raffle not found" },
        { status: 404 }
      )
    }

    if (raffle.status !== "active") {
      return NextResponse.json(
        { message: "Cannot add prizes to inactive raffle" },
        { status: 400 }
      )
    }

    raffle.prizes.push({
      name,
      description,
      claimed: false,
    })

    await raffle.save()
    return NextResponse.json(raffle.prizes[raffle.prizes.length - 1])
  } catch (error) {
    console.error("Error creating prize:", error)
    return NextResponse.json(
      { message: "Error creating prize" },
      { status: 500 }
    )
  }
}