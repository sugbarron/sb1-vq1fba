import { jsPDF } from "jspdf"
import "jspdf-autotable"

interface PDFData {
  title: string
  date: string
  data: any[]
  summary: {
    total: number
    checkedIn: number
  }
}

export async function generatePDF({ title, date, data, summary }: PDFData): Promise<Buffer> {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(16)
  doc.text(title, 14, 15)

  // Add date
  doc.setFontSize(10)
  doc.text(`Generated on: ${date}`, 14, 25)

  // Add summary
  doc.text(`Total Participants: ${summary.total}`, 14, 35)
  doc.text(`Checked In: ${summary.checkedIn}`, 14, 42)
  doc.text(`Attendance Rate: ${((summary.checkedIn / summary.total) * 100).toFixed(1)}%`, 14, 49)

  // Add table
  doc.autoTable({
    startY: 60,
    head: [["Employee ID", "Name", "Department", "Status", "Check-in Time"]],
    body: data.map(row => [
      row.employeeId,
      row.name,
      row.department,
      row.status,
      row.checkInTime,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [255, 79, 0] },
  })

  return Buffer.from(doc.output("arraybuffer"))
}