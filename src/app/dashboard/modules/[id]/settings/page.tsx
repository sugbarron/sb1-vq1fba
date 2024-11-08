"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ModuleConfig } from "@/components/modules/module-config"
import { Loader2 } from "lucide-react"

export default function ModuleSettingsPage() {
  const params = useParams()

  const { data: module, isLoading } = useQuery({
    queryKey: ["module", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/modules/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch module")
      }
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Module Settings</h1>
        <p className="text-gray-500">{module.displayName}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ModuleConfig moduleId={params.id} />
      </div>
    </div>
  )
}