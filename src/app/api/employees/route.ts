import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Employee from "@/models/Employee"
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
    const employees = await Employee.find().lean()
    
    // Serialize the documents
    const serializedEmployees = serializeDocuments(employees)

    return NextResponse.json(serializedEmployees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json(
      { message: "Error fetching employees" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
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
    
    const employee = await Employee.create({
      ...data,
      joinDate: new Date(),
    })

    // Serialize the document
    const serializedEmployee = serializeDocument(employee.toObject())
    
    return NextResponse.json(serializedEmployee, { status: 201 })
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json(
      { message: "Error creating employee" },
      { status: 500 }
    )
  }
}