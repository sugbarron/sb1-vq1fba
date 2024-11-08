import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import Event from "@/models/Event"
import { generatePDF } from "@/lib/pdf"

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

    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format")

    await dbConnect()
    const event = await Event.findById(params.id)
      .populate("participants.employeeId")

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    const attendanceData = event.participants.map((p: any) => ({
      employeeId: p.employeeId.employeeId,
      name: p.employeeId.name,
      department: p.employeeId.department,
      status: p.checkedIn ? "Checked In" : "Not Checked In",
      checkInTime: p.checkInTime ? new Date(p.checkInTime).toLocaleString() : "-",
    }))

    if (format === "csv") {
      const csvRows = [
        ["Employee ID", "Name", "Department", "Status", "Check-in Time"],
        ...attendanceData.map(row => [
          row.employeeId,
          row.name,
          row.department,
          row.status,
          row.checkInTime,
        ]),
      ]

      const csvContent = csvRows
        .map(row => row.map(cell => `"${cell}"`).join(","))
        .join("\n")

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="attendance-${event.name}-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    if (format === "pdf") {
      const pdfBuffer = await generatePDF({
        title: `Attendance Report - ${event.name}`,
        date: new Date().toLocaleDateString(),
        data: attendanceData,
        summary: {
          total: attendanceData.length,
          checkedIn: attendanceData.filter(p => p.status === "Checked In").length,
        },
      })

      return new Response(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="attendance-${event.name}-${new Date().toISOString().split("T")[0]}.pdf"`,
        },
      })
    }

    return NextResponse.json(
      { message: "Invalid export format" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error exporting attendance:", error)
    return NextResponse.json(
      { message: "Error exporting attendance" },
      { status: 500 }
    )
  }
}