import dbConnect from "@/lib/mongoose"
import User from "@/models/User"

export async function getUserByEmail(email: string) {
  await dbConnect()
  const user = await User.findOne({ email }).lean()
  if (!user) return null
  
  return {
    ...user,
    _id: user._id.toString(),
  }
}

export async function createUser(userData: {
  name: string
  email: string
  password: string
  role?: string
}) {
  await dbConnect()
  const user = await User.create(userData)
  return {
    ...user.toObject(),
    _id: user._id.toString(),
  }
}