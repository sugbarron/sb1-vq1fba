import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongoose"
import ModuleAnalytics from "@/models/ModuleAnalytics"

export async function GET(
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

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "7d"

    await dbConnect()

    const startDate = new Date()
    switch (period) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24)
        break
      case "7d":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(startDate.getDate() - 30)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }

    const analytics = await ModuleAnalytics.aggregate([
      {
        $match: {
          moduleId: new mongoose.Types.ObjectId(params.id),
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            action: "$action",
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$timestamp"
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.action",
          data: {
            $push: {
              date: "$_id.date",
              count: "$count"
            }
          }
        }
      }
    ])

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching module analytics:", error)
    return NextResponse.json(
      { message: "Error fetching module analytics" },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const { action, metadata } = await req.json()
    await dbConnect()

    const analytics = await ModuleAnalytics.create({
      moduleId: params.id,
      userId: session.user.id,
      action,
      metadata,
    })

    return NextResponse.json(analytics, { status: 201 })
  } catch (error) {
    console.error("Error logging analytics:", error)
    return NextResponse.json(
      { message: "Error logging analytics" },
      { status: 500 }
    )
  }
}