import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Setting from "@/models/Setting"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.role === "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    await dbConnect()
    const settings = await Setting.findOne({ type: "security" }).lean()

    return NextResponse.json(settings?.data || {})
  } catch (error) {
    console.error("Error fetching security settings:", error)
    return NextResponse.json(
      { message: "Error fetching settings" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.role === "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await req.json()
    await dbConnect()

    const settings = await Setting.findOneAndUpdate(
      { type: "security" },
      {
        type: "security",
        data,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    return NextResponse.json(settings.data)
  } catch (error) {
    console.error("Error updating security settings:", error)
    return NextResponse.json(
      { message: "Error updating settings" },
      { status: 500 }
    )
  }
}