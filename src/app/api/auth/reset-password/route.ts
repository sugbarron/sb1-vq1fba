import { NextResponse } from "next/server"
import { hash, compare } from "bcryptjs"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    await dbConnect()
    const user = await User.findOne({
      resetToken: { $exists: true },
      resetTokenExpiry: { $gt: new Date() }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    const isValidToken = await compare(token, user.resetToken)
    if (!isValidToken) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)
    user.password = hashedPassword
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { message: "An error occurred while resetting your password" },
      { status: 500 }
    )
  }
}