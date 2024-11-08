import { NextResponse } from "next/server"
import { createTransport } from "nodemailer"
import { hash } from "bcryptjs"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"
import { generateToken } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    await dbConnect()
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { message: "If an account exists, password reset instructions will be sent." },
        { status: 200 }
      )
    }

    const resetToken = generateToken(64)
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    const hashedToken = await hash(resetToken, 10)
    user.resetToken = hashedToken
    user.resetTokenExpiry = resetTokenExpiry
    await user.save()

    const transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    })

    return NextResponse.json(
      { message: "If an account exists, password reset instructions will be sent." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    )
  }
}