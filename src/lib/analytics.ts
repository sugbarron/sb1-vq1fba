import { getSession } from "next-auth/react"

export async function logModuleAction(
  moduleId: string,
  action: string,
  metadata?: Record<string, any>
) {
  try {
    const response = await fetch(`/api/modules/${moduleId}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, metadata }),
    })

    if (!response.ok) {
      throw new Error("Failed to log analytics")
    }
  } catch (error) {
    console.error("Error logging analytics:", error)
  }
}