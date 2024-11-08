import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Menu from "@/models/Menu"
import { serializeDocuments, serializeDocument } from "@/lib/utils"

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
    const menus = await Menu.find({ status: "active" })
      .populate("parentId")
      .sort({ order: 1 })
      .lean()

    const serializedMenus = serializeDocuments(menus)
    return NextResponse.json(serializedMenus)
  } catch (error) {
    console.error("Error fetching menus:", error)
    return NextResponse.json(
      { message: "Error fetching menus" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
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

    const menu = await Menu.create(data)
    const populatedMenu = await menu.populate("parentId")
    
    const serializedMenu = serializeDocument(populatedMenu.toObject())
    return NextResponse.json(serializedMenu, { status: 201 })
  } catch (error) {
    console.error("Error creating menu:", error)
    return NextResponse.json(
      { message: "Error creating menu" },
      { status: 500 }
    )
  }
}