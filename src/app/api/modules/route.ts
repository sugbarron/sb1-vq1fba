import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Module from "@/models/Module"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    await dbConnect()
    const modules = await Module.find({ status: "active" })
      .populate("adminRoles", "name email")
      .sort({ createdAt: -1 })

    // Filter modules based on user role and access
    const accessibleModules = modules.filter(module => {
      if (session.user.role === "admin") return true
      if (session.user.role === "module_admin" && 
          module.adminRoles.some(admin => admin._id.toString() === session.user.id)) {
        return true
      }
      return false
    })

    return NextResponse.json(accessibleModules)
  } catch (error) {
    console.error("Error fetching modules:", error)
    return NextResponse.json(
      { message: "Error fetching modules" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await req.json()
    await dbConnect()
    
    const module = await Module.create(data)
    return NextResponse.json(module, { status: 201 })
  } catch (error) {
    console.error("Error creating module:", error)
    return NextResponse.json(
      { message: "Error creating module" },
      { status: 500 }
    )
  }
}