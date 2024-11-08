"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from "zod"

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string>("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      router.push("/auth/signin")
      return
    }
    setToken(tokenParam)
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setStatus("loading")

    try {
      const validation = passwordSchema.safeParse({ password, confirmPassword })
      if (!validation.success) {
        setError(validation.error.errors[0].message)
        setStatus("error")
        return
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setTimeout(() => {
          router.push("/auth/signin")
        }, 2000)
      } else {
        setError(data.message || "An error occurred while resetting your password.")
        setStatus("error")
      }
    } catch (error) {
      setError("An error occurred while resetting your password.")
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your new password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-center text-red-500">
              {error}
            </div>
          )}
          {status === "success" && (
            <div className="text-sm text-center text-green-500">
              Password reset successful! Redirecting to login...
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="rounded-md"
                minLength={8}
              />
            </div>
            <div>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="rounded-md"
                minLength={8}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}