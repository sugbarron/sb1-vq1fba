import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Employee from "@/models/Employee"
import { serializeDocument } from "@/lib/utils"

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
    const employee = await Employee.findById(params.id).lean()
    
    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      )
    }

    // Serialize the document
    const serializedEmployee = serializeDocument(employee)

    return NextResponse.json(serializedEmployee)
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json(
      { message: "Error fetching employee" },
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
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await req.json()
    await dbConnect()

    const employee = await Employee.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true, lean: true }
    )

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      )
    }

    // Serialize the document
    const serializedEmployee = serializeDocument(employee)

    return NextResponse.json(serializedEmployee)
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json(
      { message: "Error updating employee" },
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
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    await dbConnect()
    const employee = await Employee.findByIdAndDelete(params.id)

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json(
      { message: "Error deleting employee" },
      { status: 500 }
    )
  }
}