import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Module from "@/models/Module"

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
    const module = await Module.findById(params.id)
      .populate("adminRoles", "name email")

    if (!module) {
      return NextResponse.json(
        { message: "Module not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(module)
  } catch (error) {
    console.error("Error fetching module:", error)
    return NextResponse.json(
      { message: "Error fetching module" },
      { status: 500 }
    )
  }
}