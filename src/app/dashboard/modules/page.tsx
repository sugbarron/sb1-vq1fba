"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ModuleList } from "@/components/modules/module-list"
import { ModuleDialog } from "@/components/modules/module-dialog"
import { Plus } from "lucide-react"
import { useSession } from "next-auth/react"

export default function ModulesPage() {
  const { data: session } = useSession()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: modules, isLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const response = await fetch("/api/modules")
      if (!response.ok) {
        throw new Error("Failed to fetch modules")
      }
      return response.json()
    },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Module Management</h1>
        {session?.user.role === "admin" && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        )}
      </div>

      <ModuleList modules={modules} isLoading={isLoading} />
      <ModuleDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}