import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import ModuleConfig from "@/models/ModuleConfig"
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
    const config = await ModuleConfig.findOne({ moduleId: params.id })
    
    if (!config) {
      return NextResponse.json({ settings: [] })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error fetching module config:", error)
    return NextResponse.json(
      { message: "Error fetching module config" },
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
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { settings } = await req.json()
    await dbConnect()

    // Verify module exists
    const module = await Module.findById(params.id)
    if (!module) {
      return NextResponse.json(
        { message: "Module not found" },
        { status: 404 }
      )
    }

    // Update or create config
    const config = await ModuleConfig.findOneAndUpdate(
      { moduleId: params.id },
      {
        moduleId: params.id,
        settings,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error updating module config:", error)
    return NextResponse.json(
      { message: "Error updating module config" },
      { status: 500 }
    )
  }
}