import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Menu from "@/models/Menu"
import { serializeDocument } from "@/lib/utils"

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const menu = await Menu.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true }
    ).populate("parentId")

    if (!menu) {
      return NextResponse.json(
        { message: "Menu not found" },
        { status: 404 }
      )
    }

    const serializedMenu = serializeDocument(menu.toObject())
    return NextResponse.json(serializedMenu)
  } catch (error) {
    console.error("Error updating menu:", error)
    return NextResponse.json(
      { message: "Error updating menu" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.role === "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    await dbConnect()
    
    // Instead of deleting, mark as inactive
    const menu = await Menu.findByIdAndUpdate(
      params.id,
      { status: "inactive", updatedAt: new Date() },
      { new: true }
    )

    if (!menu) {
      return NextResponse.json(
        { message: "Menu not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting menu:", error)
    return NextResponse.json(
      { message: "Error deleting menu" },
      { status: 500 }
    )
  }
}